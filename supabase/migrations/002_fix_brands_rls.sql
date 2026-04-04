-- Brands: leitura pública (todos podem ver as marcas)
-- Rodar no Supabase SQL Editor
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "brands_select" ON brands FOR SELECT USING (TRUE);

CREATE POLICY "brands_admin" ON brands FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

-- Coupons: leitura pública para cupons ativos
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons_select" ON coupons FOR SELECT USING (is_active = TRUE);

CREATE POLICY "coupons_admin" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);
