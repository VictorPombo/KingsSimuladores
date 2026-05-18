-- Migração 009: Segregação P2P de Pagamentos MSU

-- 1. Remover coluna listing_id da tabela order_items (usada apenas para carrinho Kings)
ALTER TABLE order_items DROP COLUMN IF EXISTS listing_id;

-- 2. Criar tabela marketplace_orders 
CREATE TABLE marketplace_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES marketplace_listings(id),
  
  total_price NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  kings_fee NUMERIC(10,2) NOT NULL,
  seller_net NUMERIC(10,2) NOT NULL,
  
  status TEXT DEFAULT 'pending_payment',
  mp_preference_id TEXT,
  mp_payment_id TEXT,
  
  shipping_address JSONB,
  tracking_code TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atualizar tabela commissions para apontar para marketplace_orders
ALTER TABLE commissions DROP CONSTRAINT IF EXISTS commissions_order_id_fkey;
-- Precisamos deletar as records se existirem para podermos alterar a coluna? A base é dev, vamos só dropar a coluna e recriar.
ALTER TABLE commissions DROP COLUMN IF EXISTS order_id;
ALTER TABLE commissions ADD COLUMN marketplace_order_id UUID REFERENCES marketplace_orders(id) ON DELETE CASCADE;

-- 4. Adicionar RLS no marketplace_orders
ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "marketplace_orders_select" ON marketplace_orders FOR SELECT USING (
  buyer_id = auth.uid() OR 
  seller_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "marketplace_orders_insert" ON marketplace_orders FOR INSERT WITH CHECK (
  buyer_id = auth.uid()
);

-- UPDATE: Apenas sysadmin ou webhook devem atualizar orders, logo nao precisa de policy publica de update

-- 5. Função para updated_at automático
CREATE TRIGGER set_marketplace_orders_updated_at
  BEFORE UPDATE ON marketplace_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Refazer os index básicos para performance
CREATE INDEX idx_marketplace_orders_buyer ON marketplace_orders(buyer_id);
CREATE INDEX idx_marketplace_orders_seller ON marketplace_orders(seller_id);
CREATE INDEX idx_marketplace_orders_listing ON marketplace_orders(listing_id);
