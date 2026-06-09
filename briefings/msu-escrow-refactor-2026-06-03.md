# Briefing: MSU Escrow & Payout System Refactor
**Projeto:** KingsSimuladores (Meu Simulador Usado - MSU)
**Data:** 2026-06-03
**Prioridade:** Alta

## Contexto
O Meu Simulador Usado (MSU) é um marketplace C2C/P2P de simuladores integrando como multi-tenant no monorepo `KingsSimuladores`. Atualmente, o webhook do Mercado Pago enfileira a tarefa `msu_split` para atualizar a transação contábil. Contudo, a criação real do registro na tabela `payouts` (que rastreia o cofre de escrow/retenção, despacho e liberação para o vendedor) não está implementada no código do worker do cron. Além disso, o painel de administração (`/admin/msu-pedidos`) exibe status fixos mocados.

## Stack
- Framework: Next.js 14 App Router
- Banco: Supabase (Postgres)
- Deploy: Vercel
- Repo: VictorPombo/KingsSimuladores

## MCPs disponíveis
- Supabase MCP: conectado
- GitHub MCP: conectado  
- Vercel MCP: conectado

## O que implementar

### 1. Migração de Banco (RLS para Payouts)
- Criar a migration `supabase/migrations/027_payouts_rls_policies.sql`.
- Adicionar políticas RLS na tabela `payouts`:
  - **SELECT**: Vendedores podem ver seus próprios repasses (`seller_id = auth.uid()`), compradores podem ver repasses relacionados aos itens que compraram (buscando via `order_item -> order -> customer_id`), e admins têm acesso completo.
  - **UPDATE**: Vendedores podem atualizar apenas as colunas `tracking_code` e `shipped_at` para os seus próprios registros.
  - **INSERT/DELETE**: Negados para usuários comuns (apenas service_role/admin).

### 2. Inserção de Payouts no Handler `msu_split`
- Modificar o handler `msu_split` em [route.ts](file:///Users/hadi/Documents/KingsSimuladores/apps/site/src/app/api/cron/process-jobs/route.ts).
- Após atualizar `marketplace_orders` e inserir em `commissions`, realizar o insert do repasse correspondente na tabela `payouts` com:
  - `order_item_id`: ID do item comprado (`item.id`).
  - `seller_id`: ID do vendedor (`mpOrder.seller_id`).
  - `gross_amount`: Valor bruto do item (`item.total_price`).
  - `platform_fee_percent`: Taxa da comissão (15%).
  - `platform_fee_amount`: Valor da taxa retida (`mpOrder.kings_fee`).
  - `net_amount`: Valor líquido a ser repassado ao vendedor (`mpOrder.seller_net`).
  - `status`: `'held'` (status inicial retido no escrow).

### 3. Exibição Dinâmica do Escrow no Admin
- Modificar a página de transações P2P em [msu-pedidos/page.tsx](file:///Users/hadi/Documents/KingsSimuladores/apps/site/src/app/(admin)/admin/msu-pedidos/page.tsx).
- Buscar as informações de `payouts` associadas aos itens do pedido de cada transação (fazendo a resolução em memória ou via join no Supabase).
- Substituir o status mocado "Retido (Mercado Pago)" pelo status real do payout:
  - `held`: Exibir **Retido (Escrow)** (Badge amarelo)
  - `available`: Exibir **Disponível para Repasse** (Badge verde)
  - `paid`: Exibir **Repasse Efetuado** (Badge roxo/azul)
  - `refunded`: Exibir **Reembolsado** (Badge vermelho)

## Requisitos obrigatórios
- [ ] TypeScript strict — zero erros ou declarações `any` arbitrárias.
- [ ] RLS habilitado e funcionando para a tabela `payouts`.
- [ ] Preservação de todos os dados e layouts responsivos existentes.

## Arquivos a criar/modificar
- [NEW] `supabase/migrations/027_payouts_rls_policies.sql`
- [MODIFY] [apps/site/src/app/api/cron/process-jobs/route.ts](file:///Users/hadi/Documents/KingsSimuladores/apps/site/src/app/api/cron/process-jobs/route.ts)
- [MODIFY] [apps/site/src/app/(admin)/admin/msu-pedidos/page.tsx](file:///Users/hadi/Documents/KingsSimuladores/apps/site/src/app/(admin)/admin/msu-pedidos/page.tsx)

## Comportamento esperado
- Uma compra de item MSU deve criar um registro na tabela `payouts` com status `'held'`.
- O painel admin `/admin/msu-pedidos` deve refletir em tempo real se o pagamento está retido, se o cliente já liberou o valor (ficando `'available'`) ou se o PIX manual já foi dado baixa (ficando `'paid'`).

## O que NÃO fazer
- NÃO criar uma nova tabela para controlar os status além da tabela `payouts` já existente. Use os campos nativos do PostgreSQL.
- NÃO realizar inserts no banco utilizando o cliente do Supabase do browser; utilize o `createAdminClient` no worker/cron.

## Critério de sucesso
- O script `scripts/simulate_msu.ts` executado localmente cria o pedido e enfileira o job. Ao rodar o cron `/api/cron/process-jobs`, as tabelas `commissions` e `payouts` devem ser povoadas com sucesso.
- O painel `/admin/msu-pedidos` exibe a lista com o status correto e dinâmico do repasse.
