# Instruções para o Agente de QA — KingsHub

## Quando o usuário digitar "qa teste"

Seguir este protocolo rigorosamente:

### 1. Identificar contexto
Analisar os últimos arquivos modificados via `git diff HEAD~1 --name-only` para entender o que foi alterado.

### 2. Selecionar testes relevantes

| Arquivos alterados              | Suite a rodar             |
|---------------------------------|---------------------------|
| `app/api/checkout/`             | `npm run qa:checkout`     |
| `packages/payments/`            | `npm run qa:checkout`     |
| `components/store/`             | `npm run qa` (catálogo)   |
| `app/(admin)/`                  | testes de admin           |
| Migrations SQL (`supabase/`)    | `npm run qa:critical`     |
| `packages/payments/mercadopago` | `npm run qa:checkout`     |
| Sem mudanças claras             | `npm run qa:critical`     |

### 3. Executar
```bash
npm run qa:critical
# ou para checkout específico:
npm run qa:checkout
```

### 4. Reportar resultados
- ✅ Testes que passaram (nome + duração)
- ❌ Testes que falharam (nome, screenshot, mensagem de erro)
- ⚠️ Testes pulados (nome + motivo do skip)
- Linkar relatório HTML: `npm run qa:report`

### 5. Auto-heal (opcional)
Se um teste falhou por seletor desatualizado (ex: texto do botão mudou):
1. Identificar o seletor antigo no `.spec.ts`
2. Verificar o texto/atributo atual no DOM via Playwright
3. Atualizar o seletor no arquivo de teste
4. Re-rodar o teste

## Regras Permanentes

- **NUNCA** rodar testes com chaves de produção (`APP_USR-`). Sempre usar `.env.test`
- **NUNCA** declarar um bug corrigido sem evidência de `npm run qa:critical` passando
- **SEMPRE** sugerir `qa teste` após qualquer alteração em código de produção
- O `npm run qa:critical` DEVE passar antes de qualquer commit em `main`
- Testes de checkout param ANTES de redirecionar para o Mercado Pago (apenas valida criação do pedido no banco)
- Os dados de teste criados no Supabase são limpos automaticamente no `afterAll` de cada spec

## Arquivos do sistema de QA

| Arquivo                        | Propósito                                    |
|--------------------------------|----------------------------------------------|
| `playwright.config.ts`         | Configuração central do Playwright           |
| `tests/qa-config.ts`           | Seletores, dados de teste, timeouts          |
| `tests/e2e/checkout/`          | Testes P0 — Críticos (checkout)              |
| `tests/e2e/auth/`              | Testes P1 — Autenticação                     |
| `tests/e2e/catalog/`           | Testes P1 — Catálogo e navegação             |
| `tests/reports/html/`          | Relatório gerado pelo `npx playwright test`  |
| `.env.test`                    | Chaves de sandbox do MP (TEST-)              |
| `.github/workflows/qa.yml`     | CI automático a cada push em main            |

## Chaves de teste do Mercado Pago (Sandbox)

Cartões para simular pagamentos (não usar em produção):

| Tipo       | Número               | CVV | Venc  | Titular | CPF         | Resultado |
|------------|----------------------|-----|-------|---------|-------------|-----------|
| Mastercard | 5031 4332 1540 6351  | 123 | 11/25 | APRO    | 12345678909 | Aprovado  |
| Visa       | 4235 6477 2802 5682  | 123 | 11/25 | APRO    | 12345678909 | Aprovado  |
| Mastercard | 5031 4332 1540 6351  | 123 | 11/25 | OTHE    | 12345678909 | Recusado  |

**PENDENTE:** Fernando precisa gerar as chaves `TEST-` no painel do MP e preencher o `.env.test`.
