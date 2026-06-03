-- Permitir perfis de convidado (guest checkout) sem auth_id.
-- O checkout cria profiles para compradores não-logados, mas auth_id era NOT NULL.
-- Isso causava o erro "Falha ao registrar dados do cliente" em produção.

ALTER TABLE profiles ALTER COLUMN auth_id DROP NOT NULL;
