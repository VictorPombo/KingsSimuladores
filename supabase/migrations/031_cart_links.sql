-- ─── Cart Links (Carrinho Pré-preenchido) ───
-- Links gerados pelo admin para compartilhar carrinho montado com clientes.
-- O cliente abre o link, os itens são injetados no carrinho da loja e ele paga via checkout normal.

CREATE TABLE IF NOT EXISTS cart_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  token VARCHAR(16) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  coupon_code TEXT,
  discount NUMERIC(10,2) DEFAULT 0,
  customer_name TEXT,
  notes TEXT,
  created_by UUID,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
  used_at TIMESTAMPTZ,
  order_id UUID REFERENCES orders(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_links_token ON cart_links(token);
CREATE INDEX IF NOT EXISTS idx_cart_links_expires ON cart_links(expires_at) WHERE used_at IS NULL;

-- RLS: apenas admins podem inserir/ler, API pública usa service role
ALTER TABLE cart_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar cart_links" ON cart_links
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.auth_id = auth.uid() AND profiles.role = 'admin')
  );
