/ob ler

Vou precisar que você atue como Tech Lead e implemente o refatoramento do sistema de Escrow do Meu Simulador Usado (MSU).

O briefing completo está no arquivo `briefings/msu-escrow-refactor-2026-06-03.md`. Por favor, leia este arquivo cuidadosamente.
Peço também que analise a estrutura dos arquivos `process-jobs/route.ts` e `admin/msu-pedidos/page.tsx` antes de começar a codar.

Sua missão:
1. **Banco de Dados**: Criar a migration `supabase/migrations/027_payouts_rls_policies.sql` adicionando políticas RLS na tabela `payouts` (SELECT para o vendedor, comprador e admin; UPDATE apenas para vendedor atualizar rastreio; INSERT/DELETE apenas para service_role).
2. **Backend**: Alterar o handler `msu_split` dentro de `apps/site/src/app/api/cron/process-jobs/route.ts` para que, ao processar um pedido MSU, ele efetivamente crie o registro de escrow na tabela `payouts` com o status `'held'`. Siga o de-para de campos exato que consta no briefing.
3. **Frontend Admin**: Refatorar `apps/site/src/app/(admin)/admin/msu-pedidos/page.tsx` para abandonar os status mockados e ler o status real de repasse vindo da tabela `payouts`, renderizando as cores/badges apropriadas para held, available, paid e refunded.

Regras de segurança e DX:
- Utilize apenas TypeScript estrito. 
- Mantenha a identidade visual do painel admin.
- Lembre-se que operações dentro do webhook/cron precisam ser feitas via `createAdminClient` (service_role), não cliente de browser.

Quando terminar as implementações, verifique se não há erros TypeScript. 

Como mexemos em políticas de segurança (RLS) e regras contábeis (Cron), acione o /security-auditor para fazer uma varredura nas suas implementações antes de commitar.

Se a auditoria aprovar, faça o commit com uma mensagem semântica (ex: `feat(msu): implement payouts escrow logic and admin UI`).

Por fim, rode /ob salvar para registrarmos a entrega completa do último briefing de QA!
