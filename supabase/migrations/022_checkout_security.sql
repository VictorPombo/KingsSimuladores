-- Criando a tabela de falhas do checkout com segurança (TTL de 30 dias para LGPD)
CREATE TABLE IF NOT EXISTS failed_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_email text,
  customer_phone text,
  customer_cpf_masked text,
  error_message text,
  error_details jsonb,
  cart_total numeric,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT now() + interval '30 days'
);

-- Garantir índice único para emails de convidados, evitando o erro PGRST116 no checkout
CREATE UNIQUE INDEX IF NOT EXISTS profiles_guest_email_unique 
ON profiles(email) 
WHERE auth_id IS NULL;
