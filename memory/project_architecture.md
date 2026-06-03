---
name: project-architecture
description: Stack, estrutura de pastas, integrações e padrões do monorepo KingsSimuladores
metadata:
  type: project
---

## Stack
- **Monorepo Turborepo** com `apps/site` (Next.js App Router) e `packages/db`, `packages/payments`, `packages/notifications`, `packages/shipping`
- **Banco:** Supabase (Postgres). Migrations em `supabase/migrations/`. Última migration: `023_order_jobs.sql`
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
- `* * * * *` — `/api/cron/process-jobs?secret=kings2026` (fila de jobs)
- `0 * * * *` — `/api/cron/recover-carts`
- `*/5 * * * *` — `/api/cron/verify-payments?secret=kings2026`
- `0 */2 * * *` — `/api/cron/sync-tracking?secret=kings2026`

## Padrão de Admin Client
- Usar `createAdminClient()` de `@kings/db` (não `@kings/db/server`) em rotas de API e webhooks
- Usar `createServerSupabaseClient()` de `@kings/db/server` apenas em Server Components e middleware

## Variável de ambiente pendente
- `CRON_SECRET=kings2026` (ou valor mais forte) — precisa ser adicionada no painel Vercel para o worker `process-jobs` funcionar em produção

**Why:** Referência rápida para não perder tempo descobrindo a estrutura do monorepo a cada sessão.
**How to apply:** Verificar sempre se o import usa `/server` ou não antes de editar rotas de API.
