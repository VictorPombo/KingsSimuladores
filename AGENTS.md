# AGENTS.md — Regras para Agentes de IA — KingsHub

## QA Automatizado

- Após qualquer alteração em código de produção, SEMPRE sugerir rodar `qa teste` antes de fazer push.
- Nunca declarar que um bug foi corrigido sem evidência de teste automatizado passando.
- O comando `npm run qa:critical` deve passar antes de qualquer commit em `main`.
- O protocolo completo de QA está em `tests/QA_AGENT_INSTRUCTIONS.md`.

## Quando o usuário digitar "qa teste"

1. Rodar `git diff HEAD~1 --name-only` para identificar o que mudou
2. Selecionar a suite relevante conforme a tabela em `tests/QA_AGENT_INSTRUCTIONS.md`
3. Executar com `npm run qa:critical` (ou suite específica)
4. Reportar: ✅ passou / ❌ falhou (com screenshot) / ⚠️ pulado

## Regras de Segurança

- NUNCA usar chaves de produção (`APP_USR-`) nos testes — sempre `.env.test` com chaves `TEST-`
- NUNCA commitar `.env.test` ou `.env.local`
- NUNCA fazer push para `main` sem os testes críticos passando

## Mercado Pago

- O sistema tem `sandbox_init_point` e `init_point` — testes usam APENAS `sandbox_init_point`
- Chaves de teste (`TEST-`) são geradas pelo Fernando no painel do MP
- Cartões de teste estão documentados em `tests/QA_AGENT_INSTRUCTIONS.md`

## Integração com Claude Code (Economia de Tokens & Workflow)

Sempre que atuar como Tech Lead neste projeto, você deve auxiliar o desenvolvedor ativamente a seguir o fluxo de agentes do Claude Code e a economizar tokens. Sugira o uso de cada agente nos momentos ideais:

1. **`/ob` (Contexto Obsidian - `ob.md`)**:
   - **Quando sugerir `/ob ler`**: No início de novas tarefas ou sessões vazias, para recuperar stack e a última sessão sem estourar o contexto.
   - **Quando sugerir `/ob salvar`**: Ao concluir alterações ou finalizar tarefas, para que o Claude documente o progresso de forma autônoma no vault.
2. **`/code-reviewer` (`code-reviewer.md`)**:
   - **Quando sugerir**: Antes de fazer commits em arquivos complexos de Next.js, Supabase, TypeScript ou Tailwind.
3. **`/security-auditor` (`security-auditor.md`)**:
   - **Quando sugerir**: Sempre que houver modificações em rotas de API, middlewares, autenticação, upload ou variáveis de ambiente.
4. **`/briefing-writer` (`briefing-writer.md`)**:
   - **Quando sugerir**: Quando o desenvolvedor propor uma feature complexa no Claude Code; sugira rodar o briefing-writer para exportar o briefing Markdown a ser implementado de forma segura no IDE por você (Antigravity).
