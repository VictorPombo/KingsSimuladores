-- Migração 010: Link entre marketplace_orders e orders principal

-- Adiciona a coluna order_id referenciando a tabela orders principal
ALTER TABLE marketplace_orders 
ADD COLUMN order_id UUID REFERENCES orders(id) ON DELETE CASCADE;

-- Criar um index para facilitar buscas do webhook
CREATE INDEX idx_marketplace_orders_order_id ON marketplace_orders(order_id);
