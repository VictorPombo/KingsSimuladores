-- ═══════════════════════════════════════════
-- Migração Módulo de Retenção: Carrinho Abandonado
-- Adiciona tags de automação (flags) para controlar envios
-- ═══════════════════════════════════════════

-- Adicionar colunas de status de disparo ao carrinho
ALTER TABLE cart ADD COLUMN IF NOT EXISTS wpp_1h_sent BOOLEAN DEFAULT false;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS email_24h_sent BOOLEAN DEFAULT false;
ALTER TABLE cart ADD COLUMN IF NOT EXISTS email_48h_sent BOOLEAN DEFAULT false;

-- Opcional, mas útil: adicionar um índice na data de update e nas flags para otimizar os Cron Jobs
CREATE INDEX IF NOT EXISTS idx_cart_recovery_cron ON cart (updated_at, wpp_1h_sent, email_24h_sent, email_48h_sent);
