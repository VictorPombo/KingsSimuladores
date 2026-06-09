# Briefing: Spec E2E — Checkout Seven Sim Racing
**Projeto:** KingsSimuladores
**Data:** 2026-06-04
**Prioridade:** Alta

---

## Contexto

KingsSimuladores é um e-commerce multi-tenant: o domínio `sevensimracing.com.br` é reescrito silenciosamente pelo middleware Next.js para o grupo de rotas `/(seven)/seven/*`. O catálogo Seven existe e está funcional, mas **nunca houve spec de checkout para esse tenant**. O checkout é compartilhado (`/checkout`) e diferencia a loja pelo campo `storeOrigin: 'seven'` no carrinho — o `brand_origin` do pedido resultante é `'seven'` e usa a chave `OLIST_API_KEY_SEVEN` no ERP. Uma auditoria de 2026-06-04 classificou esse gap como **crítico** (Alto risco, médio esforço).

---

## Stack

- **Framework:** Next.js 14 App Router
- **Testes:** Playwright (TypeScript)
- **Banco:** Supabase (service_role para setup/teardown)
- **Deploy:** Vercel
- **Repo:** VictorPombo/KingsSimuladores

---

## MCPs disponíveis

- Supabase MCP: conectado
- GitHub MCP: conectado
- Vercel MCP: conectado

---

## O que implementar

Criar o arquivo `tests/e2e/checkout/seven-checkout.spec.ts` com uma suíte `@critical` cobrindo o fluxo de checkout para o tenant Seven Sim Racing.

### Arquitetura do multi-tenant (para entender o contexto)

- Rota de produto Seven: `/seven/produtos/[slug]` (equivalente à `/produtos/[slug]` no Kings)
- O produto Seven tem `brand` ligada ao nome `'seven'` no Supabase
- No `AddToCartButton`, o item entra no carrinho com `storeOrigin: 'seven'`
- A página de checkout (`/checkout`) detecta o brand: `brand.toLowerCase().includes('seven') → store = 'seven'`
- O `POST /api/checkout` lê `items[0].storeOrigin` e define `storeContext = 'seven'`, gravando `brand_origin: 'seven'` no pedido

### Testes a implementar

**Teste 1 — Produto Seven aparece no catálogo Seven `@critical`**
- Navegar para `${SEVEN_URL}/produtos` (usar `process.env.SEVEN_BASE_URL ?? 'https://www.sevensimracing.com.br'`)
- Verificar que pelo menos um link `a[href*="/produtos/"]` está visível
- Screenshot: `tests/reports/seven-catalog.png`

**Teste 2 — Produto Seven pode ser adicionado ao carrinho `@critical`**
- Navegar para `${SEVEN_URL}/produtos`, clicar no primeiro produto
- Clicar em "Adicionar ao Carrinho" / "Comprar"
- Verificar que o cart count incrementa (badge no header) ou que o toast de confirmação aparece
- Screenshot: `tests/reports/seven-add-to-cart.png`

**Teste 3 — Checkout com item Seven atinge a rota `/checkout` `@critical`**
- Adicionar produto Seven ao carrinho (mesmo fluxo do Teste 2)
- Navegar para `/checkout` (rota compartilhada — **não** `/seven/checkout`)
- Verificar que a URL contém `/checkout` (não foi redirecionado para home)
- Verificar que o título da página está visível (`h1` ou heading principal)
- Screenshot: `tests/reports/seven-checkout-page.png`

**Teste 4 — Formulário de checkout aceita dados Seven `@critical`**
- Repetir o fluxo até `/checkout` com item Seven no carrinho
- Preencher os campos: nome, email, CPF, telefone, CEP
- Aguardar o preenchimento automático do endereço após CEP (debounce ~1.5s)
- Verificar que os botões de pagamento (PIX ou Cartão) estão visíveis no DOM
- Screenshot: `tests/reports/seven-checkout-form.png`

**Teste 5 — API `/api/checkout` cria pedido com `brand_origin = 'seven'` (API-level) `@critical`**
- `beforeAll`: criar via Supabase service_role um produto de teste com `brand` = Seven (usar `brands.name = 'seven'`)
- Fazer `POST /api/checkout` com `{ items: [{ storeOrigin: 'seven', ... }], customer, address, shipping }`
- Verificar na resposta que `init_point` ou `sandbox_init_point` está presente
- Consultar Supabase: `orders.brand_origin === 'seven'` para o pedido criado
- `afterAll`: limpar `order_items`, `orders`, `profiles` criados no teste
- Skip automático se `SUPABASE_SERVICE_ROLE_KEY` não estiver disponível

### Constantes e helpers reutilizáveis

- Usar `TEST_CUSTOMER` e `TIMEOUTS` de `../../qa-config`
- Definir `SEVEN_BASE_URL = process.env.SEVEN_BASE_URL ?? 'https://www.sevensimracing.com.br'`
- Seguir o padrão dos specs existentes: `test.skip(true, 'motivo')` quando pré-condição não é satisfeita, em vez de `throw`

---

## Arquivos a criar/modificar

| Ação | Arquivo |
|------|---------|
| **Criar** | `tests/e2e/checkout/seven-checkout.spec.ts` |

Opcionalmente adicionar ao `playwright.config.ts`:
```ts
// Se SEVEN_BASE_URL for diferente do BASE_URL, adicionar um project separado
// ou simplesmente usar a env var dentro do spec — preferir a segunda abordagem para não fragmentar a config
```

---

## Comportamento esperado

Ao rodar `npx playwright test tests/e2e/checkout/seven-checkout.spec.ts`:

- Testes 1-4 passam em ambiente com acesso ao domínio Seven
- Teste 5 passa se `SUPABASE_SERVICE_ROLE_KEY` estiver configurado; caso contrário, exibe `⚠️ skipped` com mensagem clara
- Zero testes `❌ failed` — falhas de pré-condição viram `⚠️ skipped`
- Screenshots geradas em `tests/reports/seven-*.png`

---

## Requisitos obrigatórios

- [ ] TypeScript strict — zero erros de tipo
- [ ] Nenhuma chamada real ao Mercado Pago — o teste vai até a criação do pedido no banco, não clica no botão MP
- [ ] `afterAll` limpa todos os dados criados no banco (produto, pedido, profile)
- [ ] Comentário de contexto no topo do arquivo explicando o modelo multi-tenant (por que `/checkout` e não `/seven/checkout`)
- [ ] Usar `test.skip` (não `test.fail`) para pré-condições ausentes

---

## O que NÃO fazer

- **Não criar uma rota `/seven/checkout`** — o checkout é deliberadamente compartilhado. O spec deve confirmar que `/checkout` funciona para itens Seven, não criar uma nova rota.
- **Não assumir que o domínio `sevensimracing.com.br` está acessível no CI** — os testes de UI (1-4) devem ter skip gracioso se o domínio retornar 404/timeout. O teste de API (Teste 5) usa `kingssimuladores.com.br/api/checkout` diretamente.
- **Não mockar o carrinho via `localStorage` diretamente** — usar o fluxo real de navegação para adicionar ao carrinho, garantindo que o `CartContext` seja corretamente populado.
- **Não hard-codar o slug do produto Seven** — usar `.first()` no seletor para pegar o primeiro produto disponível, igual ao padrão dos outros specs.

---

## Critério de sucesso

1. `npx playwright test tests/e2e/checkout/seven-checkout.spec.ts --reporter=list` mostra `5 passed` ou `4 passed | 1 skipped` (se sem service_role key)
2. O Teste 5 (API-level) confirma que `brand_origin = 'seven'` é gravado corretamente no banco
3. Nenhum `❌ failed`
4. `npx tsc --noEmit` passa sem erros no novo arquivo
