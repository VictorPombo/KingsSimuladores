-- Migration: Evolução Preços Segmentados (V2)
-- Adiciona opções de Site Todo vs Produtos Específicos

-- 1. Adicionar flag de Site Todo no Grupo de Cliente
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customer_groups' AND column_name = 'apply_to_all_products') THEN
        ALTER TABLE public.customer_groups ADD COLUMN apply_to_all_products BOOLEAN NOT NULL DEFAULT true;
    END IF;
END $$;

-- 2. Alterar a tabela de preços segmentados
-- A) Preço pode ser NULO (para herdar o desconto do grupo se o status for ativo e apply_to_all for false)
ALTER TABLE public.segmented_prices ALTER COLUMN price DROP NOT NULL;

-- B) Adicionar coluna 'status'
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'segmented_prices' AND column_name = 'status') THEN
        -- status pode ser: 'active' (recebe regra do grupo/fixa) ou 'ignored' (sem desconto)
        ALTER TABLE public.segmented_prices ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ignored'));
    END IF;
END $$;
