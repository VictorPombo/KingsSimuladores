# Briefing: Spec E2E — Fluxo Escrow MSU (Meu Simulador Usado)
**Projeto:** KingsSimuladores
**Data:** 2026-06-04
**Prioridade:** Alta

---

## Contexto

O MSU (Meu Simulador Usado) é o marketplace C2C do KingsSimuladores. Quando um comprador finaliza uma compra, o pagamento fica retido em escrow (`payouts.status = 'held'`) até a entrega confirmada. Só então o admin libera o repasse ao vendedor via `POST /api/admin/msu/pay` (que muda `payouts.status` para `paid`). **Nenhum spec E2E cobre esse fluxo** — é um gap crítico identificado na auditoria de 2026-06-04.

O fluxo completo envolve:
1. `BuyNowButton` → adiciona item MSU ao carrinho com `storeOrigin: 'msu'`
2. `POST /api/checkout` → cria pedido com `brand_origin: 'msu'`, enfileira `msu_split` em `order_jobs`
3. Webhook MP aprova pagamento → `on_order_paid` trigger atualiza o pedido
4. Cron `process-jobs` roda `msu_split` → cria `marketplace_orders` como `paid`, `commissions` e `payouts` como `held`
5. Admin confirma entrega → libera repasse via `POST /api/admin/msu/pay`

---

## Stack

- **Framework:** Next.js 14 App Router
- **Testes:** Playwright (TypeScript)
- **Banco:** Supabase (service_role para setup/teardown e validações diretas no banco)
- **Deploy:** Vercel
- **Repo:** VictorPombo/KingsSimuladores

---

## MCPs disponíveis

- Supabase MCP: conectado
- GitHub MCP: conectado
- Vercel MCP: conectado

---

## O que implementar

Criar o arquivo `tests/e2e/checkout/msu-escrow.spec.ts` com uma suíte de testes de nível de API (sem navegação UI) cobrindo o ciclo completo do escrow.

> **Estratégia:** Como o fluxo MSU depende de usuários autenticados (vendedor + comprador), webhook MP real e cron assíncrono, a suíte usa `createAdminClient()` via Supabase service_role para simular cada etapa diretamente no banco — igual ao padrão de `api-webhook-payment.spec.ts`.

### Setup (`beforeAll`)

Criar no Supabase (service_role) toda a fixture necessária:

1. **Vendor profile** (`profiles`): `full_name: 'Vendedor MSU QA'`, `email: qa-msu-seller-${Date.now()}@test.kingssimuladores.com.br`, `role: 'client'`
2. **Buyer profile** (`profiles`): `full_name: 'Comprador MSU QA'`, `email: qa-msu-buyer-${Date.now()}@test.kingssimuladores.com.br`, `role: 'client'`
3. **Brand MSU**: `select id from brands where name = 'msu'` (não criar, apenas pegar o ID existente)
4. **Marketplace listing** (`marketplace_listings`): `title: 'Volante QA MSU', price: 500.00, seller_id: vendorId, status: 'active', brand_id: msuBrandId`
5. **Order** (`orders`): `customer_id: buyerId, brand_origin: 'msu', status: 'pending', total: 500.00, preference_id: 'qa-pref-${Date.now()}'`
6. **Order item** (`order_items`): ligando o order ao listing, `store_origin: 'msu'`, `unit_price: 500, total_price: 500, quantity: 1`
7. **Marketplace order** (`marketplace_orders`): `listing_id: listingId, buyer_id: buyerId, seller_id: vendorId, mp_preference_id: order.preference_id, status: 'awaiting_payment', kings_fee: 75.00, seller_net: 425.00`

### Teardown (`afterAll`)

Limpar em ordem reversa: `commissions`, `payouts`, `marketplace_orders`, `order_items`, `orders`, `marketplace_listings`, `profiles` (vendedor + comprador).

### Testes a implementar

**Teste 1 — Checkout MSU via API cria pedido com `brand_origin = 'msu'` `@critical`**
- `POST ${BASE_URL}/api/checkout` com `{ items: [{ id: listingId, storeOrigin: 'msu', price: 500, quantity: 1, title: 'Volante QA MSU' }], customer: { nome, email, cpf, telefone }, address, shipping }`
- Verificar que a resposta contém `init_point` ou `sandbox_init_point`
- Consultar Supabase: o pedido mais recente com `brand_origin = 'msu'` e `customer` do buyer tem status `pending`
- Skip se `SUPABASE_SERVICE_ROLE_KEY` ausente

**Teste 2 — Trigger `on_order_paid`: pagamento aprovado enfileira `msu_split` `@critical`**
- Usando o pedido criado no `beforeAll`, atualizar `orders.status = 'paid'` diretamente via service_role
- Consultar `order_jobs` onde `order_id = orderId AND job_type = 'msu_split'`
- Verificar que o job foi criado com `status = 'pending'`
- Skip se `SUPABASE_SERVICE_ROLE_KEY` ausente

**Teste 3 — `msu_split` cria `payouts` com `status = 'held'` `@critical`**
- Simular o processamento do `msu_split` inserindo diretamente no banco (sem chamar o cron real):
  - Atualizar `marketplace_orders.status = 'paid'`
  - Inserir em `commissions`: `{ marketplace_order_id, seller_id: vendorId, sale_amount: 500, commission_rate: 15, commission_amount: 75, seller_payout: 425, payout_status: 'pending' }`
  - Inserir em `payouts`: `{ order_item_id, seller_id: vendorId, gross_amount: 500, platform_fee_percent: 15, platform_fee_amount: 75, net_amount: 425, status: 'held' }`
- Consultar `payouts` onde `seller_id = vendorId AND status = 'held'`
- Verificar: `payout.net_amount === 425` e `payout.platform_fee_amount === 75`
- Skip se `SUPABASE_SERVICE_ROLE_KEY` ausente

**Teste 4 — API admin libera repasse: `payouts.status` muda para `paid` `@critical`**
- Pegar o `payoutId` do payout criado no Teste 3
- `POST ${BASE_URL}/api/admin/msu/pay` com `{ payoutId }` e header de autenticação admin
  - **Atenção:** o endpoint usa `requireAdmin()` — para o teste, atualizar diretamente via service_role como fallback (explicado abaixo)
- Verificar que `payouts.status = 'paid'` após a chamada
- **Estratégia de autenticação:** Atualizar `payouts.status = 'available'` primeiro (requisito da rota), depois simular o update direto via service_role confirmando que a transição `available → paid` funciona
- Skip se `SUPABASE_SERVICE_ROLE_KEY` ausente

**Teste 5 — Payout não pode ser liberado se ainda `held` (segurança) `@critical`**
- Tentar atualizar `payouts.status = 'paid'` onde `status = 'held'` via service_role (simulando a condição de segurança do endpoint)
- A rota `POST /api/admin/msu/pay` tem `.eq('status', 'available')` — então o update não afeta linhas com `status = 'held'`
- Verificar no banco que o payout permanece `held` (rowcount = 0 no update)
- Confirmar a invariante: payout só pode ser pago quando `available`, nunca direto de `held`

---

## Arquivos a criar/modificar

| Ação | Arquivo |
|------|---------|
| **Criar** | `tests/e2e/checkout/msu-escrow.spec.ts` |

---

## Comportamento esperado

Ao rodar `npx playwright test tests/e2e/checkout/msu-escrow.spec.ts --reporter=list`:

- `5 passed` se `SUPABASE_SERVICE_ROLE_KEY` estiver configurado
- `0 passed | 5 skipped` se a service_role key não estiver disponível (skip gracioso com mensagem clara)
- Zero `❌ failed`
- O fluxo completo `pending → paid → held → available → payout_paid` é validado em banco

---

## Requisitos obrigatórios

- [ ] TypeScript strict — zero erros de tipo
- [ ] `afterAll` **obrigatório** — limpar todas as fixtures criadas, na ordem correta (FK constraints)
- [ ] Nenhuma chamada real ao Mercado Pago — escrow simulado diretamente no banco
- [ ] Comentário no topo do arquivo explicando a estratégia (por que simulação direta em vez de UI)
- [ ] Usar `test.skip(true, 'SERVICE_ROLE_KEY necessário')` para todos os testes (não apenas alguns)

---

## O que NÃO fazer

- **Não tentar autenticar como admin via Playwright UI** para chamar `POST /api/admin/msu/pay` — o `requireAdmin()` usa `createServerSupabaseClient()` com cookie de sessão. Em vez disso, validar a lógica de transição de status diretamente no banco via service_role.
- **Não depender de `marketplace_listings` existentes em produção** — criar o listing de teste no `beforeAll` com dados isolados (slug/título com timestamp).
- **Não assumir comissão fixa de 15%** no código do teste — ler o valor de `kings_fee` e `seller_net` do `marketplace_orders` criado no `beforeAll` para as asserções de valor.
- **Não criar migrations ou alterar o schema** — a tabela `payouts` já existe com as colunas `status`, `net_amount`, `platform_fee_amount`, `held`, `available`, `paid`.
- **Não usar `test.only`** — o spec deve rodar normalmente na suíte completa.

---

## Critério de sucesso

1. `npx playwright test tests/e2e/checkout/msu-escrow.spec.ts` mostra `5 passed` ou `5 skipped` (sem `failed`)
2. O Teste 3 confirma: `payouts.net_amount = 425` e `payouts.platform_fee_amount = 75` para um pedido de R$ 500 com 15% de comissão
3. O Teste 5 confirma a invariante de segurança: payout `held` não pode ser marcado como `paid` diretamente
4. `npx tsc --noEmit` passa sem erros no novo arquivo

---

## Referências de código (para o Antigravity consultar)

| Arquivo | O que tem |
|---------|-----------|
| `apps/site/src/app/api/admin/msu/pay/route.ts` | Handler de liberação de repasse — `.eq('status', 'available')` |
| `apps/site/src/app/api/cron/process-jobs/route.ts` (handler `msu_split`) | Lógica que cria `marketplace_orders`, `commissions` e `payouts` |
| `tests/e2e/checkout/api-webhook-payment.spec.ts` | Padrão de setup/teardown com service_role a seguir |
| `tests/qa-config.ts` | `BASE_URL`, `TIMEOUTS`, `TEST_CUSTOMER` |
