# Briefing: Monitoramento do Cron `verify-payments`
**Projeto:** KingsSimuladores
**Data:** 2026-06-04
**Prioridade:** Alta

---

## Contexto

KingsSimuladores é um e-commerce de simuladores de corrida com checkout via Mercado Pago. O cron `GET /api/cron/verify-payments` é a rede de segurança que detecta pedidos que o webhook do MP deixou pendentes — ele consulta a API do MP e re-dispara o webhook quando encontra um pagamento aprovado. Uma auditoria realizada em 2026-06-04 identificou **3 pedidos pagos sem sincronização ERP**, evidenciando que o cron pode falhar silenciosamente sem qualquer alerta.

---

## Stack

- **Framework:** Next.js 14 App Router
- **Banco:** Supabase (Postgres), acesso via `createAdminClient()` (service_role)
- **Deploy:** Vercel (crons configurados via `vercel.json`)
- **Repo:** VictorPombo/KingsSimuladores
- **Linguagem:** TypeScript strict

---

## MCPs disponíveis

- Supabase MCP: conectado
- GitHub MCP: conectado
- Vercel MCP: conectado

---

## O que implementar

### Layer 1 — Log estruturado no cron existente

Modificar `apps/site/src/app/api/cron/verify-payments/route.ts` para adicionar, **antes do `return NextResponse.json(...)`** final, um log estruturado no formato:

```ts
console.log('[CRON_METRIC]', JSON.stringify({
  cron: 'verify-payments',
  ts: new Date().toISOString(),
  checked: pendingOrders.length,
  fixed: updated,
  results,
}))
```

Isso torna os logs filtráveis no Vercel dashboard com `[CRON_METRIC]` como prefixo.

### Layer 2 — Endpoint de healthcheck para Uptime Robot

Criar **novo arquivo** `apps/site/src/app/api/health/cron-verify/route.ts` com um `GET` handler que:

1. **Autenticação:** lê o header `Authorization`, valida `Bearer ${CRON_SECRET}`. Retorna 401 se inválido ou ausente.
2. **Consulta Supabase:** usando `createAdminClient()`, conta pedidos na tabela `orders` onde:
   - `status = 'pending'`
   - `preference_id IS NOT NULL` (foram enviados ao MP)
   - `created_at < now() - interval '30 minutes'` (pendentes há mais de 30 minutos)
3. **Calcula** `oldest_pending_minutes`: tempo em minutos desde `created_at` do pedido mais antigo no resultado.
4. **Retorna:**
   - HTTP **200** + `{ status: 'ok', pending_count: N, oldest_pending_minutes: N }` se `pending_count < 5`
   - HTTP **503** + `{ status: 'alert', pending_count: N, oldest_pending_minutes: N }` se `pending_count >= 5`

> O Uptime Robot monitora o HTTP status code — 200 = saudável, 503 = alerta.

---

## Arquivos a criar/modificar

| Ação | Arquivo |
|------|---------|
| **Modificar** | `apps/site/src/app/api/cron/verify-payments/route.ts` |
| **Criar** | `apps/site/src/app/api/health/cron-verify/route.ts` |

---

## Comportamento esperado

Após a implementação:

| Requisição | Resultado esperado |
|------------|--------------------|
| `GET /api/health/cron-verify` sem header | `401 Unauthorized` |
| `GET /api/health/cron-verify` com `Authorization: Bearer <CRON_SECRET>` e 0 pedidos pendentes antigos | `200 { status: 'ok', pending_count: 0, oldest_pending_minutes: 0 }` |
| Mesma requisição com ≥5 pedidos pendentes há +30min | `503 { status: 'alert', pending_count: N, oldest_pending_minutes: N }` |
| Logs do cron `verify-payments` no Vercel | Contêm linha com prefixo `[CRON_METRIC]` e JSON parseable |

---

## Requisitos obrigatórios

- [ ] TypeScript strict — zero erros de tipo
- [ ] `CRON_SECRET` lido de `process.env.CRON_SECRET` — nunca hardcoded
- [ ] Sem RLS necessário (acesso via `createAdminClient` / service_role, rota de API interna)
- [ ] Sem novo dado sensível exposto na resposta — apenas contagens numéricas e status string
- [ ] O endpoint healthcheck deve funcionar mesmo se o banco retornar 0 resultados (não lançar exceção)

---

## O que NÃO fazer

- **Não usar `supabase.rpc()` com SQL raw** para calcular `oldest_pending_minutes` — use `.select('created_at').order('created_at', { ascending: true }).limit(1)` e calcule o delta em JS para manter a lógica legível e sem risco de SQL injection.
- **Não retornar os dados dos pedidos** (IDs, preference_ids) no response do healthcheck — apenas as métricas agregadas. O endpoint é público para o Uptime Robot e não deve vazar dados de pedidos.
- **Não remover a autenticação** mesmo que pareça "só um healthcheck" — o endpoint revela informação operacional sensível (volume de pedidos pendentes).
- **Não modificar a lógica do cron** além do `console.log` — apenas adicionar o log estruturado ao final, antes do `return`.

---

## Critério de sucesso

1. `curl -H "Authorization: Bearer $CRON_SECRET" https://www.kingssimuladores.com.br/api/health/cron-verify` retorna JSON com os campos `status`, `pending_count` e `oldest_pending_minutes`.
2. `curl https://www.kingssimuladores.com.br/api/health/cron-verify` (sem header) retorna 401.
3. Nos logs do Vercel, após o próximo disparo do cron, aparece uma linha com `[CRON_METRIC]` e JSON válido.
4. `npx tsc --noEmit` passa sem erros nos arquivos modificados/criados.

---

## Configuração pós-deploy (Fernando faz manualmente)

Após o deploy, configurar no **Uptime Robot** (https://uptimerobot.com):

| Campo | Valor |
|-------|-------|
| Monitor type | HTTP(s) |
| Friendly Name | KingsHub — cron verify-payments |
| URL | `https://www.kingssimuladores.com.br/api/health/cron-verify` |
| Monitoring Interval | 5 minutes |
| Custom HTTP Headers | `Authorization: Bearer <CRON_SECRET>` |
| Alert When | Status != 200 (503 dispara alerta) |
| Alert Contact | Email do Fernando |

> `CRON_SECRET` está nas variáveis de ambiente da Vercel — copiar o valor de lá.
