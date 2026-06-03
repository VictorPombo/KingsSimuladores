---
name: project-bg-jobs
description: Implementação da fila assíncrona pós-pagamento concluída em Jun 2026 — o que foi feito e o que falta
metadata:
  type: project
---

## Contexto
O webhook do Mercado Pago estava executando até 10 integrações externas de forma síncrona (Olist, Frenet, e-mails, WhatsApp), causando timeout e loop de retries do MP. Pedidos pagos ficavam sem NF-e e sem etiqueta.

## O que foi implementado (2026-06-03)

### Migration 023 — `supabase/migrations/023_order_jobs.sql`
Tabela `order_jobs` com `UNIQUE(order_id, job_type)` para idempotência.
View `dead_order_jobs` para alertas no painel admin.

### Webhook atômico — `apps/site/src/app/api/webhooks/mercadopago/route.ts`
Agora faz APENAS:
1. Verificação no MP
2. `UPDATE orders SET status = 'paid'`
3. Baixa de estoque (banco local)
4. Limpeza do carrinho
5. Update sub-ledger MSU
6. `INSERT INTO order_jobs` (todos os jobs externos)
Retorna 200 em < 200ms.

### Worker — `apps/site/src/app/api/cron/process-jobs/route.ts`
- Puxa 20 jobs `pending` por execução, FIFO
- Handlers implementados: `olist_erp`, `frenet_label`, `notify_customer_whatsapp`, `notify_customer_email`, `notify_admin_email`, `msu_seller_email`
- Retry até 3x; após isso vira `dead` (aparece na view `dead_order_jobs`)
- Protegido por `?secret=CRON_SECRET`

### vercel.json atualizado
Cron `* * * * *` apontando para `/api/cron/process-jobs?secret=kings2026`

## Pendência em produção
Adicionar `CRON_SECRET=kings2026` (ou valor mais forte) nas env vars do Vercel.

## Migration 022 (anterior, já aplicada)
- `failed_checkouts` — tabela para carrinhos abortados com CPF mascarado e TTL 30 dias
- Índice `UNIQUE` em `profiles(email) WHERE auth_id IS NULL` para evitar duplicatas de convidados

**Why:** Registrar o estado exato do sistema para não reprocessar o que já foi feito.
**How to apply:** Em próximas sessões, verificar se `CRON_SECRET` foi adicionada e se a migration 023 foi aplicada (`supabase db push`).
