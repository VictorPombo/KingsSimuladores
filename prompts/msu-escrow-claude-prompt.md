/ob ler

Vou precisar que você atue como Tech Lead e implemente o Item 3 da nossa auditoria de QA: "Spec E2E — Fluxo Escrow MSU".

O briefing completo está no arquivo `briefings/kings-msu-escrow-e2e-2026-06-04.md`. Por favor, leia este arquivo cuidadosamente antes de começar.

Sua missão:
1. Criar o arquivo `tests/e2e/checkout/msu-escrow.spec.ts`.
2. Implementar toda a suíte de 5 testes descrita no briefing. Use a abordagem de simulação direta no banco de dados via `service_role` (consulte `tests/e2e/checkout/api-webhook-payment.spec.ts` como referência de arquitetura de setup/teardown).
3. Garantir tipagem estrita (TypeScript) e que os hooks `beforeAll` e `afterAll` limpem todas as constraints de FK corretamente na ordem correta para não quebrar o banco.
4. Garantir que os testes recebam um `test.skip()` de forma graciosa se a `SUPABASE_SERVICE_ROLE_KEY` não estiver definida.

Quando você terminar de escrever o código, rode `npx playwright test tests/e2e/checkout/msu-escrow.spec.ts --workers=1` para validar. 

Se os testes passarem (ou derem skipped corretamente caso falte a key), acione o /code-reviewer para revisar a qualidade do arquivo TypeScript E2E gerado. Se o review aprovar, pode commitar com a mensagem semântica apropriada (ex: `test: add MSU escrow e2e flow`).

Após o commit bem sucedido, rode /ob salvar para registrar no Vault que concluímos este Briefing de QA.
