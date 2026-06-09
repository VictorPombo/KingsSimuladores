/ob ler

Atue como meu Tech Lead e me ajude a configurar as variáveis de ambiente deste projeto neste novo PC de forma segura.

O projeto exige arquivos `.env.local` (para desenvolvimento) e `.env.test` (para a suíte de testes E2E do Playwright). **Nunca devemos commitar as chaves reais nem gravá-las no histórico de chat se pudermos evitar**.

Sua missão agora é interagir comigo para montar esses arquivos:

### PASSO 1: Mapeamento de Chaves
Eu preciso que você me pergunte, UM POR UM (ou em pequenos blocos, para facilitar), os valores para as seguintes chaves fundamentais que usamos no projeto:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

**Mercado Pago (Dev/Prod):**
- `MP_ACCESS_TOKEN` (ou `MP_ACCESS_TOKEN_KINGS`)
- `MP_WEBHOOK_SECRET`

**Fretes & APIs (se necessário agora):**
- `FRENET_TOKEN`
- `CRON_SECRET`

### PASSO 2: Geração do .env.local
Assim que eu te fornecer as chaves do Passo 1, crie automaticamente o arquivo `.env.local` na raiz do projeto contendo essas chaves.

### PASSO 3: Geração do .env.test (REGRAS DE QA)
Após criar o `.env.local`, crie o `.env.test` baseando-se nas chaves que te passei, mas aplicando **OBRIGATORIAMENTE** a regra de segurança do nosso `AGENTS.md`:
- As chaves de Mercado Pago no `.env.test` **NÃO PODEM** ser as chaves de produção (`APP_USR-`). 
- No `.env.test`, preencha as chaves do Mercado Pago com o prefixo `TEST-` (chaves de Sandbox geradas pelo Fernando). Se eu não te passar as chaves de teste, deixe-as em branco para eu preencher manualmente depois, mas **não copie as de produção para lá**.
- Adicione as URLs locais para testes: 
  `BASE_URL=http://localhost:3015`
  `NEXT_PUBLIC_URL_KINGS=http://localhost:3015`

### PASSO 4: Segurança
- Verifique o `.gitignore` para garantir que `.env.local` e `.env.test` estão ignorados.
- Se não estiverem, adicione-os e faça um commit `chore: ignore env files`.

**Quando estiver pronto, inicie me fazendo a primeira pergunta para coletarmos os dados do Passo 1.**
