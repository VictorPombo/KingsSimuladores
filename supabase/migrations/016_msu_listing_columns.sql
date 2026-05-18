-- ═══════════════════════════════════════════
-- MIGRAÇÃO 016: Adição de colunas estruturais para MSU
-- Data: 2026-04-27
-- ═══════════════════════════════════════════

-- Adicionando colunas necessárias para os filtros e display do MSU
ALTER TABLE marketplace_listings
ADD COLUMN IF NOT EXISTS brand TEXT,
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS has_original_box BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_usage_marks BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS category TEXT, -- Mantido por compatibilidade com a migração anterior se estiver usando string ao invés de category_id
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMPTZ;

-- Índices para melhorar a performance de busca nos filtros
CREATE INDEX IF NOT EXISTS idx_listings_brand ON marketplace_listings (brand);
CREATE INDEX IF NOT EXISTS idx_listings_state ON marketplace_listings (state);
CREATE INDEX IF NOT EXISTS idx_listings_featured ON marketplace_listings (is_featured);
