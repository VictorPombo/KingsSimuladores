-- Adicionando campos obrigatórios NCM e EAN para viabilizar sincronização Omnichannel (Olist/Bling)
ALTER TABLE products 
ADD COLUMN ncm text,
ADD COLUMN ean text;

-- Atualizar metadados para garantir que esses novos dados possam ser processados nas notas fiscais
COMMENT ON COLUMN products.ncm IS 'Nomenclatura Comum do Mercosul (Obrigatório para ERP e Shopee/ML)';
COMMENT ON COLUMN products.ean IS 'European Article Number / Código de Barras (Obrigatório para ERP e Shopee/ML)';
