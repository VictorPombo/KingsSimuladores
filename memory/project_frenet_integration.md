---
name: project-frenet-integration
description: Implementação da geração automática de etiquetas via Frenet API V2 — estado, arquivos, pendências e padrões
metadata:
  type: project
---

Integração Frenet V2 para geração automática de etiquetas implementada em 2026-06-03.

**Why:** Automatizar o fluxo pós-compra de frete — antes as etiquetas eram geradas manualmente no painel da Frenet.

**How to apply:** Quando mexer em checkout, cron jobs ou shipping, consultar este contexto para entender o fluxo completo.

## Arquivos modificados

- `supabase/migrations/026_shipping_service_id.sql` — ADD COLUMN `shipping_service_id TEXT` e `ticket_url TEXT` na tabela `orders`
- `packages/shipping/src/frenet.ts` — `generateShippingLabel()` implementada com fluxo V2 real
- `apps/site/src/app/api/checkout/route.ts` — captura `shipping.service_id` ou `shipping.id` do payload e salva em `orders.shipping_service_id`
- `apps/site/src/app/api/cron/process-jobs/route.ts` — handler `frenet_label` atualizado para buscar `shipping_service_id` do banco e salvar `ticket_url`

## Fluxo Frenet V2 implementado

`generateShippingLabel(orderData, itemsData)` em `packages/shipping/src/frenet.ts`:

1. `POST https://api.frenet.com.br/api/v2/me/cart` — cria carrinho logístico, retorna `CartId`
2. `POST https://api.frenet.com.br/api/v2/me/shipment/checkout` — debita da carteira Frenet usando `CartId`
3. `POST https://api.frenet.com.br/api/v2/me/shipment/generate` — gera etiqueta, retorna `TrackingNumber` e `LabelUrl`

Retorna `{ success: true, tracking_code, ticket_url }` ou **lança erro** (nunca retorna `success: false`) para ativar o retry automático do cron.

## Variáveis de ambiente necessárias

- `FRENET_TOKEN` — token da API Frenet (já existia)
- `FRENET_SENDER_CEP` — CEP do armazém de origem (default: `06407120` se não configurado)

## Pendência crítica

**A migration `026_shipping_service_id.sql` ainda NÃO foi aplicada ao Supabase.**
Não há `supabase login` configurado localmente e não há psql/DB URL direta.
Victor precisa aplicar manualmente via SQL Editor do Dashboard:
`https://supabase.com/dashboard/project/mlrcaugthlkscusyxqrf/sql/new`

SQL a executar:
```sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_service_id TEXT,
  ADD COLUMN IF NOT EXISTS ticket_url TEXT;
```

Até a migration ser aplicada, checkouts novos vão falhar silenciosamente ao tentar salvar `shipping_service_id` (coluna não existe). O campo `ticket_url` também não será persistido.

## Como o checkout passa o service_id

O frontend deve incluir `shipping.service_id` (ou `shipping.id`) no payload do checkout:
```json
{ "shipping": { "name": "SEDEX", "price": "45.00", "service_id": "FR" } }
```
O campo é salvo em `orders.shipping_service_id` na inserção do pedido.

## Cron worker

No handler `frenet_label` (`process-jobs/route.ts`):
- Busca `shipping_service_id` diretamente do banco (mais confiável que payload cacheado no job)
- Após sucesso: salva `tracking_code` + `ticket_url` em `orders`
- Se `shipping_service_id` estiver ausente → lança erro → cron entra em retry (máx 3x → dead)

## Dimensões padrão

Se o produto não tiver `weight_kg`, `length_cm`, `height_cm`, `width_cm` cadastrados:
- Peso: 5 kg, Comprimento: 60 cm, Altura: 40 cm, Largura: 40 cm
