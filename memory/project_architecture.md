---
name: project-architecture
description: Stack, estrutura de pastas, integrações e padrões do monorepo KingsSimuladores
metadata:
  type: project
---

## Stack
- **Monorepo Turborepo** com `apps/site` (Next.js App Router) e `packages/db`, `packages/payments`, `packages/notifications`, `packages/shipping`
- **Banco:** Supabase (Postgres). Migrations em `supabase/migrations/`. Última migration: `024_order_jobs_updated_at.sql`
- **Pagamento:** Mercado Pago (webhook em `/api/webhooks/mercadopago/route.ts`)
- **ERP:** Olist/Tiny (via `pushOrderToOlist` do pacote `@kings/payments`)
- **Logística:** Frenet (via `generateShippingLabel` do pacote `@kings/shipping`)
- **Notificações:** Chatwoot/WhatsApp + Resend/Email (via `@kings/notifications`)
- **Deploy:** Vercel. Config em `apps/site/vercel.json`

## Lojas no sistema
- `kings` — Kings Simuladores (CNPJ 29.688.089/0001-02)
- `seven` — Seven Sim Racing (CNPJ 61.219.783/0001-93)
- `msu` — Meu Simulador Usado (marketplace C2C, emite NF pela Kings)

## Crons ativos (vercel.json)
- `* * * * *` — `/api/cron/process-jobs` (fila de jobs)
- `0 * * * *` — `/api/cron/recover-carts`
- `*/5 * * * *` — `/api/cron/verify-payments`
- `0 */2 * * *` — `/api/cron/sync-tracking`
- Autenticação via header `Authorization: Bearer <CRON_SECRET>`

## Tabelas chave do sistema de filas
- `order_jobs` — fila de jobs com `status` (pending/processing/done/dead), `retry_count`, `error_log`, `updated_at`
- `dead_order_jobs` — view para alertas no painel admin (jobs com status `dead`)
- `marketplace_orders` — subledger MSU com `kings_fee`, `seller_net`, `status`, `mp_payment_id`
- `commissions` — registro contábil de comissões por venda MSU

## Tokens MP por loja (packages/payments/src/mercadopago.ts)
```
kings: MP_ACCESS_TOKEN_KINGS || MP_ACCESS_TOKEN
usado: MP_ACCESS_TOKEN_MSU || MP_ACCESS_TOKEN
seven: MP_ACCESS_TOKEN_SEVEN
```

## Padrão de Admin Client
- Usar `createAdminClient()` de `@kings/db` (não `@kings/db/server`) em rotas de API e webhooks
- Usar `createServerSupabaseClient()` de `@kings/db/server` apenas em Server Components e middleware

## Admin multi-tenant (cookie `admin_store`)
- Seletor no `AdminSidebar.tsx` — dropdown com Kings, MSU, Seven, Todas
- Cookie `admin_store` (valores: `kings | msu | seven | all`) persiste no browser por 1 ano
- `pedidos/page.tsx` lê o cookie server-side e filtra a query por `brand_origin`
- Seven já está 100% integrada — só falta env vars

**Why:** Referência rápida para não perder tempo descobrindo a estrutura do monorepo a cada sessão.
**How to apply:** Verificar sempre se o import usa `/server` ou não antes de editar rotas de API. Checar env vars antes de testar MSU/Seven em produção.
