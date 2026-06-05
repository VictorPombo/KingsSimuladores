---
name: project-bg-jobs
description: Fila assíncrona pós-pagamento + War Room MSU/Seven — estado completo em 2026-06-03
metadata:
  type: project
---

## Contexto
O webhook do Mercado Pago estava executando até 10 integrações externas de forma síncrona (Olist, Frenet, e-mails, WhatsApp), causando timeout e loop de retries do MP. Pedidos pagos ficavam sem NF-e e sem etiqueta.

## O que foi implementado (2026-06-03) — Dia 1

### Migration 023 — `supabase/migrations/023_order_jobs.sql`
Tabela `order_jobs` com `UNIQUE(order_id, job_type)` para idempotência.
View `dead_order_jobs` para alertas no painel admin.

### Migration 024 — `supabase/migrations/024_order_jobs_updated_at.sql`
- Adiciona coluna `updated_at timestamptz` na `order_jobs`
- Trigger para auto-atualizar `updated_at` em qualquer UPDATE
- Índice parcial `order_jobs_processing_stale_idx` para rescue query eficiente
- **PENDENTE APLICAR EM PRODUÇÃO:** `supabase db push`

### Webhook atômico — `apps/site/src/app/api/webhooks/mercadopago/route.ts`
- Verificação HMAC-SHA256 via `x-signature` header (função `verifyMPSignature`)
- Fail-open se `MP_WEBHOOK_SECRET` não estiver setada (compatibilidade dev)
- Faz APENAS operações locais + `INSERT INTO order_jobs`
- Retorna 200 em < 200ms
- Jobs enfileirados para MSU incluem `msu_split` + `msu_seller_email`

### Worker — `apps/site/src/app/api/cron/process-jobs/route.ts`
- Rescue de jobs travados: jobs em `processing` há > 5 min voltam para `pending`
- `updated_at` atualizado no lock acquisition e no done
- Handlers implementados: `olist_erp`, `frenet_label`, `notify_customer_whatsapp`, `notify_customer_email`, `notify_admin_email`, `msu_seller_email`, `msu_split`, **`emit_nfe`** (novo — 2026-06-03)
- Retry até 3x; após isso vira `dead` (aparece em `dead_order_jobs`)

### Handler `emit_nfe` (novo — 2026-06-03 NFe Session)
- Enfileirado automaticamente pelo handler `olist_erp` após injeção bem-sucedida com `erp_id`
- Payload: `{ erp_id, order_id, store }`
- Chama `emitNfeTiny(erp_id, apiKey)` — POST para `nota.fiscal.emitir.php`
- Se situação = "Aprovada/Autorizada": chama `getNfeLinkTiny` e atualiza `invoices` com `status='issued'` + `pdf_url`
- Se situação = "Processando/Pendente": lança erro → cron faz retry automático
- Resolve a necessidade de o usuário clicar em "Sincronizar" manualmente no painel

### Handler `msu_split` (novo — 2026-06-03 War Room)
- Marca `marketplace_orders.status = 'paid'` com `mp_payment_id`
- Insere em `commissions` com `sale_amount`, `commission_rate`, `commission_amount`, `seller_payout`, `payout_status = 'pending'`

### Checkout MSU — `apps/site/src/app/api/checkout/route.ts`
- Calcula `msuMarketplaceFee` (taxa Kings) antes de criar a preference
- Passa `marketplaceFee` para `createPreference` — agora o MP retém a comissão na fonte
- **Requer aplicação Marketplace aprovada no MP** para funcionar de verdade

## Variáveis de ambiente pendentes (Vercel Dashboard)

| Variável | Para quê | Onde pegar |
|---|---|---|
| `MP_WEBHOOK_SECRET` | Blindagem criptográfica webhook | MP Dashboard → Integrações → Webhooks |
| `OLIST_API_KEY_SEVEN` | NF-e com CNPJ Seven | Painel Olist Seven |
| `MP_ACCESS_TOKEN_SEVEN` | Pagamentos Seven | MP Dashboard conta Seven |
| `MP_ACCESS_TOKEN_MSU` | Pagamentos MSU | MP Dashboard conta MSU |
| `CRON_SECRET` | Autenticação do Cron worker | Qualquer string forte |

## Pré-requisito crítico MSU (fora do código)
Criar **Aplicação Marketplace** no MP Dashboard → Suas Integrações → Criar Aplicação → Tipo: Marketplace. Aprovação leva 1–3 dias. Sem isso, `marketplace_fee` é enviado mas ignorado pelo MP.

## Status Seven no admin
Seven já está 100% pronta no código do admin:
- `StoreContext.tsx` — tipo `seven` reconhecido
- `AdminSidebar.tsx` — dropdown + seção de menu Seven com laranja (`#ea580c`)
- `pedidos/page.tsx` — filtra por `brand_origin = 'seven'` via cookie `admin_store`
- `PedidosClient.tsx` — badge SEVEN + filtro client-side
- NF-e Seven usa CNPJ `61.219.783/0001-93` hardcoded no cron
- Só falta as env vars `OLIST_API_KEY_SEVEN` e `MP_ACCESS_TOKEN_SEVEN`

## Wrapper Olist — funções adicionadas (2026-06-03)

`packages/payments/src/olist.ts` — duas novas exportações:

- **`emitNfeTiny(tinyOrderId, apiKey)`** — POST `nota.fiscal.emitir.php`, retorna situação como string. Lança erro se HTTP falhar ou Tiny retornar status != OK. Envia `enviarEmail=S` por padrão.
- **`getNfeLinkTiny(tinyOrderId, apiKey)`** — busca `id_nota_fiscal` via `pedido.obter.php`, depois URL do PDF via `nota.fiscal.obter.link.php`. Retorna `string | null`.

Ambas exportadas via `export *` no `packages/payments/src/index.ts`.

## Feature: Sync Manual Tiny ERP — implementada em 2026-06-03 (SDD)

Spec: `/Users/hadi/VaultsObisidian/NextHub/wiki/projetos/KingsSimuladores/Spec Admin Sync Tiny.md`

### Arquivos criados/modificados (escopo fechado conforme spec)

**`apps/site/src/app/api/admin/orders/force-tiny-sync/route.ts`** — novo
- `POST { order_id: string }`
- Busca pedido com join em `order_items(product: sku, title, ncm, ean)` + `profiles!customer_id`
- Mapeia para `OlistOrderInput` com CFOP por UF (5102 SP / 6102 outros)
- Chama `pushOrderToOlist` do `@kings/payments`
- Erro do Tiny → propaga mensagem exata com status 502
- Sucesso → `orders.erp_id` atualizado + `upsert` em `invoices` (sem duplicar)

**`apps/site/src/app/(admin)/admin/pedidos/PedidosClient.tsx`** — modificado
- Estado `forceSyncingErp: string | null`
- Função `handleForceTinySync` usa `setFeedback` (toast) — zero `alert()` nativos
- Botão "Sincronizar no ERP" (estilo outline) visível para `paid | shipped | delivered`
- Loading state: ícone `RefreshCw` com animação `spin`, texto "Sincronizando...", `disabled`, `opacity: 0.6`

## Próximos passos
- Conectar dashboard financeiro do vendedor MSU com dados reais de `marketplace_orders` + `commissions`
- Verificar `used/dashboard/page.tsx` e alimentar aba financeira
- Confirmar se `OLIST_API_KEY_SEVEN` e `OLIST_API_KEY_KINGS` estão configuradas na Vercel para que `emit_nfe` funcione em produção

**Why:** Registrar o estado exato para não reprocessar o que já foi feito.
**How to apply:** Em próximas sessões, verificar se as env vars foram adicionadas e se migration 024 foi aplicada antes de avançar para dashboard financeiro MSU.
