-- Migração 030: Remoção retroativa da conta mock semeada em produção
--
-- A migração 003 (seed_mock_seller) já rodou em ambientes onde não deveria,
-- criando um usuário logável de verdade (piloto_mock@kingshub.dev, senha
-- conhecida no histórico do repo) em auth.users. A migração 003 foi corrigida
-- para não repetir isso (guard por app.seed_environment), mas isso não desfaz
-- o que já foi aplicado. Esta migração remove a conta existente.
--
-- Se a conta mock tiver dados dependentes reais (anúncios, pedidos, reviews
-- referenciando profiles.id via FK sem CASCADE), o DELETE falha com
-- foreign_key_violation e é capturado abaixo — nesse caso a limpeza deve ser
-- feita manualmente após revisar o que está associado a essa conta.

DO $$
DECLARE
  mock_user_id uuid;
BEGIN
  SELECT id INTO mock_user_id
  FROM auth.users
  WHERE email = 'piloto_mock@kingshub.dev';

  IF mock_user_id IS NULL THEN
    RAISE NOTICE 'Conta mock piloto_mock@kingshub.dev não encontrada — nada a limpar.';
    RETURN;
  END IF;

  BEGIN
    -- profiles.auth_id -> auth.users(id) ON DELETE CASCADE (migração 001),
    -- então remover de auth.users já leva o profile junto.
    DELETE FROM auth.users WHERE id = mock_user_id;
    RAISE NOTICE 'Conta mock piloto_mock@kingshub.dev removida (id: %).', mock_user_id;
  EXCEPTION WHEN foreign_key_violation THEN
    RAISE WARNING 'Não foi possível remover a conta mock % — há dados dependentes (anúncios/pedidos/reviews) referenciando este profile. Revise e limpe manualmente antes de remover.', mock_user_id;
  END;
END $$;
