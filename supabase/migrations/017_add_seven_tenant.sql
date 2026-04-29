-- Migration: Add 'seven' brand and multi-tenant support

-- 1. Add 'seven' to brand_name enum
ALTER TYPE brand_name ADD VALUE IF NOT EXISTS 'seven';

-- 2. Insert Seven Sim Racing into brands
INSERT INTO brands (name, cnpj, display_name, settings)
VALUES (
  'seven',
  '00.000.000/0003-00', -- Preencher com CNPJ real depois
  'Seven Sim Racing',
  '{"primary_color":"#facc15"}' -- Cor amarelo/gold (exemplo)
)
ON CONFLICT (name) DO NOTHING;
