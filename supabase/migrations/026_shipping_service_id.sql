-- Adiciona campos necessários para geração automática de etiquetas via Frenet V2.
-- shipping_service_id: ID do serviço escolhido pelo cliente na cotação (ex: "FR", "SEDEX")
-- ticket_url: URL do PDF da etiqueta gerado pela Frenet após o checkout logístico

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_service_id TEXT,
  ADD COLUMN IF NOT EXISTS ticket_url TEXT;

COMMENT ON COLUMN orders.shipping_service_id IS 'ID do serviço de frete retornado pela Frenet na cotação (salvo no checkout para geração posterior da etiqueta)';
COMMENT ON COLUMN orders.ticket_url IS 'URL do PDF da etiqueta de envio gerado pela Frenet V2 após pagamento confirmado';
