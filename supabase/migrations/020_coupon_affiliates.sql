-- ═══════════════════════════════════════════
-- Módulo de Cupons - Adição de Afiliados
-- Adiciona suporte a repasse de comissão para influenciadores
-- ═══════════════════════════════════════════

ALTER TABLE coupons
ADD COLUMN IF NOT EXISTS influencer_name TEXT,
ADD COLUMN IF NOT EXISTS affiliate_percentage NUMERIC(5,2) DEFAULT 0;
