-- Migration: 018_seven_integration.sql
-- Integrar marca Seven, adicionar colunas de ERP/Tray

-- 1. Certificar que a marca 'seven' existe
INSERT INTO brands (name, cnpj, display_name, settings)
VALUES (
  'seven',
  '00.000.000/0003-00', -- Placeholder para o CNPJ real da Seven
  'Seven Sim Racing',
  '{"primary_color":"#ff6b00"}'
)
ON CONFLICT (name) DO NOTHING;

-- 2. Adicionar campos na tabela products para vínculo com a Tray
ALTER TABLE products ADD COLUMN IF NOT EXISTS tray_id TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_kg NUMERIC(8,3);

-- 3. Adicionar campo na tabela orders para vínculo com Olist/Tiny
ALTER TABLE orders ADD COLUMN IF NOT EXISTS erp_id TEXT;

-- 4. Criar Índices de performance e restrição única
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_tray_id_brand_id
  ON products(tray_id, brand_id)
  WHERE tray_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_erp_id 
  ON orders(erp_id)
  WHERE erp_id IS NOT NULL;

-- As políticas de RLS para leitura pública ("status = 'active'") e acesso admin
-- já estão cobertas pelas policies 'products_select' e 'products_admin' 
-- originais da migration 001_initial_schema.sql.
