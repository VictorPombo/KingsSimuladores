-- ═══════════════════════════════════════════════════════════════
-- Kings Hub — Initial Schema Migration
-- Projeto: mlrcaugthlkscusyxqrf
-- Rodar no Supabase SQL Editor em ordem
-- ═══════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════
-- BLOCO 1: Extensions e tipos customizados
-- ═══════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- busca full-text

CREATE TYPE user_role AS ENUM ('client', 'seller', 'admin');
CREATE TYPE brand_name AS ENUM ('kings', 'msu');
CREATE TYPE product_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE listing_status AS ENUM ('pending_review', 'active', 'sold', 'rejected');
CREATE TYPE listing_condition AS ENUM ('like_new', 'good', 'fair');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'shipped', 'delivered', 'cancelled');
CREATE TYPE order_type AS ENUM ('direct', 'marketplace');
CREATE TYPE invoice_status AS ENUM ('pending', 'issued', 'cancelled');
CREATE TYPE payout_status AS ENUM ('pending', 'paid');
CREATE TYPE coupon_type AS ENUM ('percent', 'fixed', 'shipping');

-- ═══════════════════════════════════════════
-- BLOCO 2: Tabelas (rodar em ordem)
-- ═══════════════════════════════════════════

-- 1. brands (precisa existir antes de products)
CREATE TABLE brands (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         brand_name UNIQUE NOT NULL,
  cnpj         TEXT NOT NULL,
  display_name TEXT NOT NULL,
  settings     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. profiles (espelho do auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id     UUID UNIQUE NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name   TEXT,
  cpf_cnpj    TEXT,
  phone       TEXT,
  email       TEXT,
  role        user_role DEFAULT 'client',
  addresses   JSONB DEFAULT '[]',
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. categories
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  parent_id   UUID REFERENCES categories (id),
  brand_scope brand_name,  -- NULL = ambas as marcas
  sort_order  INT DEFAULT 0
);

-- 4. products
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id        UUID NOT NULL REFERENCES brands (id),
  category_id     UUID REFERENCES categories (id),
  title           TEXT NOT NULL,
  description     TEXT,
  slug            TEXT UNIQUE NOT NULL,
  price           NUMERIC(10,2) NOT NULL,
  price_compare   NUMERIC(10,2),
  stock           INT NOT NULL DEFAULT 0,
  sku             TEXT UNIQUE,
  cnpj_emitente   TEXT NOT NULL,
  status          product_status DEFAULT 'draft',
  attributes      JSONB DEFAULT '{}',
  images          TEXT[] DEFAULT '{}',
  weight_kg       NUMERIC(6,3),
  dimensions_cm   JSONB,  -- {width, height, length}
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. marketplace_listings
CREATE TABLE marketplace_listings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id        UUID NOT NULL REFERENCES profiles (id),
  title            TEXT NOT NULL,
  description      TEXT,
  price            NUMERIC(10,2) NOT NULL,
  condition        listing_condition NOT NULL,
  status           listing_status DEFAULT 'pending_review',
  images           TEXT[] DEFAULT '{}',
  rejection_reason TEXT,
  commission_rate  NUMERIC(4,2) NOT NULL DEFAULT 10.00,
  shipping_options JSONB DEFAULT '{}',
  category_id      UUID REFERENCES categories (id),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 6. orders
CREATE TABLE orders (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id      UUID NOT NULL REFERENCES profiles (id),
  brand_origin     brand_name NOT NULL,
  order_type       order_type DEFAULT 'direct',
  status           order_status DEFAULT 'pending',
  subtotal         NUMERIC(10,2) NOT NULL,
  shipping_cost    NUMERIC(10,2) DEFAULT 0,
  discount         NUMERIC(10,2) DEFAULT 0,
  total            NUMERIC(10,2) NOT NULL,
  payment_method   TEXT,
  payment_id       TEXT,  -- ID do Mercado Pago
  preference_id    TEXT,  -- preference_id do MP
  cnpj_emitente    TEXT,
  shipping_address JSONB,
  tracking_code    TEXT,
  coupon_id        UUID,
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- 7. order_items
CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id     UUID NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products (id),
  listing_id   UUID REFERENCES marketplace_listings (id),
  quantity     INT NOT NULL DEFAULT 1,
  unit_price   NUMERIC(10,2) NOT NULL,
  total_price  NUMERIC(10,2) NOT NULL
);

-- 8. invoices
CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id       UUID NOT NULL REFERENCES orders (id),
  cnpj_emitente  TEXT NOT NULL,
  nfe_number     TEXT,
  nfe_key        TEXT,
  status         invoice_status DEFAULT 'pending',
  xml_url        TEXT,
  pdf_url        TEXT,
  provider_id    TEXT,  -- ID retornado pelo NFe.io
  issued_at      TIMESTAMPTZ,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- 9. commissions
CREATE TABLE commissions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id          UUID NOT NULL REFERENCES orders (id),
  seller_id         UUID NOT NULL REFERENCES profiles (id),
  sale_amount       NUMERIC(10,2) NOT NULL,
  commission_rate   NUMERIC(4,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  seller_payout     NUMERIC(10,2) NOT NULL,
  payout_status     payout_status DEFAULT 'pending',
  paid_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- 10. cart
CREATE TABLE cart (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
  brand       brand_name NOT NULL,
  items       JSONB DEFAULT '[]',
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (customer_id, brand)
);

-- 11. coupons
CREATE TABLE coupons (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        TEXT UNIQUE NOT NULL,
  brand_scope brand_name,  -- NULL = ambas
  type        coupon_type NOT NULL,
  value       NUMERIC(10,2) NOT NULL,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  expires_at  TIMESTAMPTZ,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════
-- BLOCO 3: Indexes (performance)
-- ═══════════════════════════════════════════
CREATE INDEX idx_products_brand ON products (brand_id);
CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_slug ON products (slug);
CREATE INDEX idx_products_search ON products USING GIN (to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));
CREATE INDEX idx_listings_status ON marketplace_listings (status);
CREATE INDEX idx_listings_seller ON marketplace_listings (seller_id);
CREATE INDEX idx_orders_customer ON orders (customer_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_payment_id ON orders (payment_id);
CREATE INDEX idx_profiles_auth ON profiles (auth_id);

-- ═══════════════════════════════════════════
-- BLOCO 4: RLS — Segurança por linha
-- ═══════════════════════════════════════════

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- PROFILES: cada usuário vê só o próprio perfil; admin vê todos
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (
  auth_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth_id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth_id = auth.uid());

-- PRODUCTS: públicos para leitura; escrita só para admin
CREATE POLICY "products_select" ON products FOR SELECT USING (status = 'active' OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "products_admin" ON products FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

-- CATEGORIES: públicas para leitura
CREATE POLICY "categories_select" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "categories_admin" ON categories FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

-- MARKETPLACE LISTINGS: públicos ativos; vendedor edita os seus; admin tudo
CREATE POLICY "listings_select" ON marketplace_listings FOR SELECT USING (
  status = 'active' OR
  seller_id = (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "listings_seller" ON marketplace_listings FOR ALL USING (
  seller_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
);

-- ORDERS: cada cliente vê os próprios; admin vê todos
CREATE POLICY "orders_select" ON orders FOR SELECT USING (
  customer_id = (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (
  customer_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
);

-- ORDER_ITEMS: segue a mesma regra de orders
CREATE POLICY "order_items_select" ON order_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (
      o.customer_id = (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
    )
  )
);

-- INVOICES: cliente vê as do próprio pedido; admin vê todas
CREATE POLICY "invoices_select" ON invoices FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = invoices.order_id
    AND (
      o.customer_id = (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
      EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
    )
  )
);

-- COMMISSIONS: vendedor vê as próprias; admin vê todas
CREATE POLICY "commissions_select" ON commissions FOR SELECT USING (
  seller_id = (SELECT id FROM profiles WHERE auth_id = auth.uid()) OR
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

-- CART: cada usuário acessa só o próprio
CREATE POLICY "cart_own" ON cart FOR ALL USING (
  customer_id = (SELECT id FROM profiles WHERE auth_id = auth.uid())
);

-- ═══════════════════════════════════════════
-- BLOCO 5: Triggers automáticos
-- ═══════════════════════════════════════════

-- Criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (auth_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_listings_updated_at BEFORE UPDATE ON marketplace_listings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Decrementar estoque ao confirmar pedido
CREATE OR REPLACE FUNCTION decrement_stock_on_payment() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    UPDATE products p
    SET stock = stock - oi.quantity
    FROM order_items oi
    WHERE oi.order_id = NEW.id AND oi.product_id = p.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_order_paid
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION decrement_stock_on_payment();

-- ═══════════════════════════════════════════
-- SEED: Inserir as 2 marcas iniciais
-- ═══════════════════════════════════════════
-- ⚠️ Substituir os CNPJs pelos reais antes de rodar em produção
INSERT INTO brands (name, cnpj, display_name, settings) VALUES
  ('kings', '00.000.000/0001-00', 'Kings Simuladores', '{"primary_color":"#00e5ff"}'),
  ('msu',   '00.000.000/0002-00', 'Meu Simulador Usado', '{"primary_color":"#8b5cf6"}');
