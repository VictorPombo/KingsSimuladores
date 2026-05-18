-- ═══════════════════════════════════════════
-- Módulo: Grades de Variação (Variation Grids)
-- ═══════════════════════════════════════════

-- 1. Definição Global de Grades (ex: Tamanho, com opções P, M, G)
CREATE TABLE IF NOT EXISTS variation_grids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,  -- 'Tamanho', 'Cores', etc.
  options JSONB NOT NULL DEFAULT '[]', -- ['P', 'M', 'G', 'GG']
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Futuro: Link entre o Produto (Pai) e o Grid (Quais opções o produto possui)
-- (Reservendo estrutura para a próxima feature...)
CREATE TABLE IF NOT EXISTS product_variations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE,
  price NUMERIC(10,2), -- sobrescreve o valor do produto base se preenchido
  stock INT NOT NULL DEFAULT 0,
  attributes JSONB NOT NULL DEFAULT '{}', -- ex: {"Tamanho": "M", "Cores": "Azul"}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Gatilhos de Update
CREATE TRIGGER set_variation_grids_updated_at BEFORE UPDATE ON variation_grids FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER set_product_variations_updated_at BEFORE UPDATE ON product_variations FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- RLS Segurança
ALTER TABLE variation_grids ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variations ENABLE ROW LEVEL SECURITY;

-- Leitura livre / Escrita apenas por admins
CREATE POLICY "variation_grids_select" ON variation_grids FOR SELECT USING (TRUE);
CREATE POLICY "variation_grids_admin" ON variation_grids FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

CREATE POLICY "product_variations_select" ON product_variations FOR SELECT USING (TRUE);
CREATE POLICY "product_variations_admin" ON product_variations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);
