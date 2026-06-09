# Relatório de Auditoria — Roteamento Automático de NF-e e Etiquetas

**Projeto:** KingsSimuladores (Antigravity)  
**Stack:** Next.js 14 + TypeScript + Turborepo + Supabase + Vercel  
**Data:** 2026-06-08  

---

## FASE 0 — Orientação no Projeto

| Item | Resultado |
|---|---|
| **Gerenciador de pacotes** | `npm@10.8.2` |
| **Monorepo** | Turborepo (`turbo.json`) + npm workspaces |
| **Workspaces** | `apps/site`, `apps/kings-store`, `packages/{config,db,notifications,payments,shipping,ui,utils}` |
| **MCPs ativos** | Nenhum MCP de plataforma configurado — `.claude/` tem apenas `settings.local.json` + skills locais |
| **Pasta `.claude`** | Existe: `settings.local.json` + `skills/{briefing-writer, code-reviewer, ob, obsidian-context, security-auditor}` |

---

## FASE 1 — Variáveis de Ambiente

| Variável | Existe? | Onde está |
|---|---|---|
| `FRENET_TOKEN` | ✅ | `.env.local` + `vercel.env` (genérico, legado) |
| `FRENET_TOKEN_KINGS` | ⚠️ | `.env.local` **apenas** — não está no `vercel.env` |
| `FRENET_TOKEN_SEVEN` | ⚠️ | `.env.local` **apenas** — não está no `vercel.env` |
| `FRENET_CEP_ORIGEM_KINGS` | ✅ | `.env.local` |
| `FRENET_CEP_ORIGEM_SEVEN` | ✅ | `.env.local` |
| `OLIST_API_KEY_KINGS` | ✅ | `.env.local` + `vercel.env` |
| `OLIST_API_KEY_SEVEN` | ✅ | `.env.local` + `vercel.env` |
| `OLIST_ACCESS_TOKEN` | ✅ | `.env.local` + `vercel.env` (legado) |
| `MP_ACCESS_TOKEN` | ✅ | `.env.local` + `vercel.env` |
| `MP_ACCESS_TOKEN_SEVEN` | ✅ | `.env.local` + `vercel.env` |
| `MP_ACCESS_TOKEN_MSU` | ✅ | `vercel.env` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | `.env.local` |
| `RESEND_FROM_KINGS` | ✅ | `.env.local` |
| `RESEND_FROM_MSU` | ✅ | `.env.local` |

> **⚠️ Risco crítico:** `vercel.env` ainda usa `FRENET_TOKEN` genérico. As chaves multitenant `FRENET_TOKEN_KINGS` e `FRENET_TOKEN_SEVEN` **não estão configuradas em produção**.

---

## FASE 2 — Banco de Dados

### 2.1 — Tabela `products`

**Colunas:** `id`, `brand_id`, `category_id`, `title`, `description`, `slug`, `price`, `price_compare`, `stock`, `sku`, `cnpj_emitente`, `status`, `attributes`, `images`, `weight_kg`, `dimensions_cm`, `created_at`, `updated_at`, `ncm`, `ean`, `tray_id`, `seller_id`, `views`, `bumped_at`

| Campo | Status | Detalhe |
|---|---|---|
| `brand_id` | ✅ UUID | 185 produtos Kings / 3 produtos Seven |
| `cnpj_emitente` | ✅ | Kings: `29.688.089/0001-02` preenchido; Seven QA: `00000000000000` (inválido) |
| `store_origin` | ❌ | Não existe nesta tabela (está em `order_items`) |

**Exemplos:**
- Kings: `Volante FSR V2 Fórmula` — `brand_id: 8523885d...` — `cnpj_emitente: 29.688.089/0001-02`
- Seven: `Produto QA Webhook` — `brand_id: 15c7f799...` — `cnpj_emitente: 00000000000000` ❌

### 2.2 — Tabela `orders`

**Colunas:** `id`, `customer_id`, `brand_origin`, `order_type`, `status`, `subtotal`, `shipping_cost`, `discount`, `total`, `payment_method`, `payment_id`, `preference_id`, `cnpj_emitente`, `shipping_address`, `tracking_code`, `coupon_id`, `notes`, `created_at`, `updated_at`, `erp_id`, `order_number`, `shipping_service_id`, `ticket_url`

| Campo | Status | Detalhe |
|---|---|---|
| `brand_origin` | ✅ | 100% dos 50 pedidos têm `kings` (nenhum Seven real ainda) |
| `cnpj_emitente` | ❌ | `null` em 100% dos pedidos — não preenchido no checkout |

### 2.3 — Tabela `order_jobs`

**Colunas:** `id`, `order_id`, `job_type`, `status`, `retry_count`, `payload`, `error_log`, `created_at`, `processed_at`, `updated_at`

**Tipos de job registrados:** `frenet_label`, `notify_admin_email`, `notify_customer_email`, `notify_customer_whatsapp`, `olist_erp`

> `emit_nfe` existe como handler no código mas é gerado dinamicamente após `olist_erp` completar — não aparece em jobs históricos pois completa rápido.

| Job | Separação por empresa |
|---|---|
| `olist_erp` | ✅ roteia por `OLIST_API_KEY_SEVEN` / `OLIST_API_KEY_KINGS` |
| `emit_nfe` | ✅ roteia por `OLIST_API_KEY_SEVEN` / `OLIST_API_KEY_KINGS` |
| `frenet_label` | ❌ usa `FRENET_TOKEN` único global |

### 2.4 — Tabela `brands`

| name | display_name | cnpj |
|---|---|---|
| `kings` | Kings Simuladores | `29.688.089/0001-02` |
| `seven` | Seven Sim Racing | `61.219.783/0001-93` |
| `msu` | Meu Simulador Usado | `29.688.089/0001-02` |

> Tabela `stores` não existe — `brands` é o equivalente.

---

## FASE 3 — Código: Mapeamento do Fluxo

### 3.1 — Frontend: Página de Produto Kings

**Arquivo:** `apps/site/src/app/(store)/produtos/[id]/page.tsx:198`

```tsx
// ❌ HARDCODED — linha 198
storeOrigin: 'kings',
```

O `brand_id` do produto vindo do banco não é lido para determinar a loja. Funciona hoje porque todos os produtos Kings têm `brand_id` correto, mas **quebraria com produtos Seven exibidos nessa rota**.

### 3.2 — Checkout

**Arquivo:** `apps/site/src/app/api/checkout/route.ts`

```ts
// Linha 155 — deriva storeContext do primeiro item
const firstStore = items[0].storeOrigin || 'kings'
const storeContext = firstStore === 'seven' ? 'seven' : (firstStore === 'msu' ? 'msu' : 'kings')

// Linha 202 — salva no pedido ✅
brand_origin: storeContext,

// Linha 264 — salva por item ✅
store_origin: item.storeOrigin || 'kings',
```

O checkout propaga corretamente o `storeOrigin` — o problema está na **origem hardcoded no frontend**.

### 3.3 — Jobs de Background

**Arquivo:** `apps/site/src/app/api/cron/process-jobs/route.ts`

**`olist_erp` — ✅ Roteamento correto:**
```ts
const apiKey = store === 'seven'
  ? process.env.OLIST_API_KEY_SEVEN
  : process.env.OLIST_API_KEY_KINGS

const cnpjEmitente = cnpjPorLoja[store] || cnpjPorLoja.kings
```

**`emit_nfe` — ✅ Roteamento correto:**
```ts
const apiKey = store === 'seven'
  ? process.env.OLIST_API_KEY_SEVEN
  : (process.env.OLIST_API_KEY_KINGS || process.env.OLIST_ACCESS_TOKEN)
```

**`frenet_label` — ❌ SEM roteamento:**
```ts
// generateShippingLabel não recebe brand_origin — usa FRENET_TOKEN global
const labelResult = await generateShippingLabel(orderWithService, items)
```

### 3.4 — Frenet

**Arquivo:** `packages/shipping/src/frenet.ts`

```ts
// Linha 49 — calculateShipping
const token = process.env.FRENET_TOKEN  // ❌ token único

// Linha 131 — generateShippingLabel
const token = process.env.FRENET_TOKEN  // ❌ token único

// CEP de origem — também fixo
const SENDER_POSTAL_CODE = process.env.FRENET_SENDER_CEP || '06407120'
// ❌ FRENET_SENDER_CEP não existe no env; FRENET_CEP_ORIGEM_KINGS/SEVEN existem mas não são usados
```

`generateShippingLabel` não recebe parâmetro de empresa. `FRENET_TOKEN_KINGS` e `FRENET_TOKEN_SEVEN` existem no `.env.local` mas **são completamente ignorados**.

### 3.5 — Admin de Produtos

**Arquivo:** `apps/site/src/app/(admin)/admin/produtos/[id]/EditProductForm.tsx`

```tsx
// Linha 377 — CNPJ Emitente ✅ existe com default inteligente
<label>CNPJ Emitente</label>
<input name="cnpj_emitente"
  defaultValue={product.cnpj_emitente || (product.brand_name === 'seven' ? '61.219.783/0001-93' : '29.688.089/0001-02')}
/>
```

- ✅ Campo `cnpj_emitente` existe e tem default por empresa
- ❌ `brand_id` **não é editável** — sem dropdown "Empresa Responsável"

### 3.6 — Upsells

**Arquivo:** `apps/site/src/components/store/upsell/UpsellEngine.tsx:73`

```tsx
// ❌ HARDCODED — não herda do produto principal
storeOrigin: 'kings',
```

---

## FASE 4 — Git: Últimas Mudanças Relevantes

| Commit | Mensagem | Observação |
|---|---|---|
| `1ed7526` | `feat(shipping): support multi-tenant Frenet tokens for Kings and Seven` | Variáveis criadas no env, mas **frenet.ts ainda usa `FRENET_TOKEN` genérico** |
| `59b19fc` | `fix: adicionar pastas de webhook do olist que não estavam versionadas` | — |
| `8a57b80` | `feat: enable Olist integration` | — |
| `4732393` | `feat: add blocking under-development popup for Seven and MSU stores` | Seven ainda em desenvolvimento |

---

## FASE 5 — Diagnóstico Final

| Ponto | Status | Observação |
|---|---|---|
| Campo `brand_id` na tabela `products` | ✅ existe | UUID, 185 Kings / 3 Seven |
| Campo `brand_origin` na tabela `orders` | ✅ existe | 100% `kings` por enquanto |
| `cnpj_emitente` na tabela `orders` | ❌ sempre null | Não preenchido no checkout |
| `order_jobs` com separação por empresa | ✅ parcial | `olist_erp` e `emit_nfe` roteiam; `frenet_label` não |
| `FRENET_TOKEN_SEVEN` no Vercel (produção) | ❌ falta | Só no `.env.local` |
| `FRENET_TOKEN_KINGS` no Vercel (produção) | ❌ falta | Só no `.env.local` |
| Olist separado para Seven | ✅ sim | `OLIST_API_KEY_SEVEN` em ambos os envs |
| `storeOrigin` hardcoded na página Kings | ❌ ainda hardcoded | `page.tsx:198` |
| `storeOrigin` hardcoded no UpsellEngine | ❌ ainda hardcoded | `UpsellEngine.tsx:73` |
| `storeOrigin` na página Seven | ✅ correto | Já usa `'seven'` |
| Checkout salva empresa correta | ✅ sim | Deriva do `storeOrigin` do item |
| `olist_erp` roteia por empresa | ✅ sim | Correto |
| `emit_nfe` roteia por empresa | ✅ sim | Correto |
| Frenet multiempresa (`frenet_label`) | ❌ token único | `generateShippingLabel` usa `FRENET_TOKEN` genérico |
| CEP de origem Frenet multiempresa | ❌ fixo | `FRENET_SENDER_CEP` inexistente → fallback `06407120` hardcoded |
| Admin permite editar `brand_id` | ❌ não | Sem dropdown de empresa |
| Produtos Seven com CNPJ válido | ❌ | `cnpj_emitente = 00000000000000` no QA |
| Gateway MP configurado na Seven/Olist | ⚠️ verificar manualmente | `MP_ACCESS_TOKEN_SEVEN` existe, mas vinculação no painel Tiny não confirmada |

---

## FASE 6 — Perguntas para o Time

1. **Frenet Seven**: A Seven (Sabrina Prado) tem conta separada na Frenet com token próprio? O `FRENET_TOKEN_SEVEN` no `.env.local` é um token real ou placeholder?
   → Confirmar antes de implementar o roteamento.

2. **Olist/Tiny para Seven**: O Mercado Pago já foi vinculado como gateway de pagamento dentro da empresa "Seven" no painel do Tiny/Olist?
   → **Ação manual obrigatória** antes de qualquer pedido Seven real.

3. **CEP de origem Seven**: O armazém da Seven é diferente de Kings?
   → Se sim, confirmar o CEP para que `FRENET_CEP_ORIGEM_SEVEN` seja usado no roteamento.

4. **Produtos Seven reais**: Os 3 produtos com `brand_id` Seven são reais ou apenas QA?
   → O `cnpj_emitente` `00000000000000` precisa ser corrigido antes de emitir NF-e.

---

## FASE 7 — Plano de Execução

> Ordem de implementação baseada em dependências técnicas e risco.

### 1. [CRÍTICO — Imediato] Adicionar variáveis no Vercel

Adicionar no painel Vercel (ou via `vercel env add`):
- `FRENET_TOKEN_KINGS`
- `FRENET_TOKEN_SEVEN`
- `FRENET_CEP_ORIGEM_KINGS`
- `FRENET_CEP_ORIGEM_SEVEN`

### 2. [Frenet] Suporte multitenant em `generateShippingLabel`

**Arquivo:** `packages/shipping/src/frenet.ts`

Adicionar parâmetro `storeOrigin` e selecionar token/CEP:
```ts
export async function generateShippingLabel(orderData: any, itemsData: any[], storeOrigin = 'kings') {
  const token = storeOrigin === 'seven'
    ? process.env.FRENET_TOKEN_SEVEN
    : process.env.FRENET_TOKEN_KINGS || process.env.FRENET_TOKEN

  const senderPostalCode = storeOrigin === 'seven'
    ? process.env.FRENET_CEP_ORIGEM_SEVEN
    : process.env.FRENET_CEP_ORIGEM_KINGS || process.env.FRENET_SENDER_CEP || '06407120'
  // ...
}
```

Fazer o mesmo em `calculateShipping` para cotações Seven.

### 3. [Jobs] Passar `brand_origin` para `generateShippingLabel`

**Arquivo:** `apps/site/src/app/api/cron/process-jobs/route.ts`

```ts
async frenet_label(payload, supabase) {
  const { order, items } = payload
  const storeOrigin = order.brand_origin || 'kings'  // ← adicionar
  // ...
  const labelResult = await generateShippingLabel(orderWithService, items, storeOrigin)
}
```

### 4. [Frontend] Remover hardcode na página de produto Kings

**Arquivo:** `apps/site/src/app/(store)/produtos/[id]/page.tsx:198`

Substituir:
```tsx
storeOrigin: 'kings',
// por:
storeOrigin: product.brand?.name === 'seven' ? 'seven' : 'kings',
```
(Requer que a query do produto inclua `brands(name)`.)

### 5. [Frontend] Corrigir UpsellEngine

**Arquivo:** `apps/site/src/components/store/upsell/UpsellEngine.tsx:73`

Receber `storeOrigin` como prop do produto principal e propagar para os itens de upsell.

### 6. [Admin] Adicionar dropdown "Empresa Responsável"

**Arquivo:** `apps/site/src/app/(admin)/admin/produtos/[id]/EditProductForm.tsx`

Adicionar `<select name="brand_id">` com as opções Kings / Seven consultadas da tabela `brands`.

### 7. [Dados] Corrigir CNPJ dos produtos Seven

Atualizar `cnpj_emitente` dos 3 produtos com `brand_id = 15c7f799...` de `00000000000000` para `61.219.783/0001-93`.

### 8. [Olist] Configurar MP na empresa Seven no Tiny (ação manual)

Entrar no painel Olist/Tiny com a conta Seven e vincular Mercado Pago como gateway de pagamento.

### 9. [Teste] Validar fluxo ponta a ponta

1. Comprar produto Seven via Sandbox MP
2. Verificar `brand_origin = seven` no pedido
3. Confirmar `olist_erp` usa `OLIST_API_KEY_SEVEN`
4. Confirmar `emit_nfe` emite pela empresa Seven no Tiny
5. Confirmar `frenet_label` usa `FRENET_TOKEN_SEVEN` e CEP de origem Seven
6. Verificar tracking code e PDF da etiqueta

---

## Resumo Executivo

A infraestrutura de banco (`brands`, `brand_origin`, `store_origin`) e os jobs `olist_erp`/`emit_nfe` **já suportam multi-empresa corretamente**.

**Os dois bloqueadores críticos são:**

1. **`generateShippingLabel` usa `FRENET_TOKEN` único** — precisa receber `storeOrigin` e selecionar token/CEP por empresa.
2. **`storeOrigin: 'kings'` hardcoded** na página de produto Kings e no `UpsellEngine` — precisa ler `brand_id` do produto.

O restante são ajustes pontuais de dados e variáveis de ambiente.
