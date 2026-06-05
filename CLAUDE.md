@AGENTS.md

## Contexto do Projeto (Obsidian Vault - Economia de Tokens)

Este projeto utiliza o agente simplificado `/ob` para gerenciar o contexto da sessão de forma automática e economizar tokens.
O arquivo de contexto deste projeto está localizado em: `~/NextHub/wiki/projetos/KingsSimuladores/kings-simuladores.md`

- **Início da Sessão**: Sempre inicie a conversa carregando o contexto com `/ob ler`. O agente detectará este projeto de forma automática.
- **Fim da Sessão**: Sempre salve as alterações feitas ao final com `/ob salvar` para que o agente resuma as modificações e atualize o histórico de sessões automaticamente, sem necessidade de digitação ou inputs adicionais.

## Knowledge Base (Karpathy LLM Wiki) - Monovault Architecture

O projeto está conectado ao vault global do Obsidian localizado em: `/Users/hadi/VaultsObisidian/NextHub/`

- Leia `/Users/hadi/VaultsObisidian/NextHub/WIKI_SCHEMA.md` para convenções.
- O diretório `raw/` contém documentos de origem imutáveis. Clippings da web caem aqui.
- O diretório `wiki/` é o SEU domínio. É dividido em duas áreas:
  1. `wiki/globais/` — Conhecimento aplicável a todos os 14 projetos (padrões Supabase, Tailwind, etc.).
  2. `wiki/projetos/KingsSimuladores/kings-simuladores.md` — Histórico e status específico deste projeto gerenciado de forma automática pelo agente `/ob`.
- Sempre consulte o arquivo `wiki/projetos/KingsSimuladores/kings-simuladores.md` para contexto local, e `wiki/globais/` para padrões técnicos.
- Quando eu disser "ingest [source]", salve o resumo em `wiki/globais/` se for um conceito técnico geral, ou no arquivo do projeto se for específico.
