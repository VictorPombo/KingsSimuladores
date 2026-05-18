-- Migration: Tabelas para Preços Segmentados
-- Permite definir grupos de clientes (Atacadistas, VIPs) e preços específicos por produto/grupo.

-- 1. Create Customer Groups Table
CREATE TABLE IF NOT EXISTS public.customer_groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    discount_percent NUMERIC NOT NULL DEFAULT 0.0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (Service Role bypasses this, public users shouldn't see all groups)
ALTER TABLE public.customer_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for customer groups"
    ON public.customer_groups FOR SELECT
    USING (true);

-- 2. Modify Profiles Table to link users to a group
-- Add column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'customer_group_id') THEN
        ALTER TABLE public.profiles ADD COLUMN customer_group_id UUID REFERENCES public.customer_groups(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 3. Create Segmented Prices Table (for specific product overrides per group)
CREATE TABLE IF NOT EXISTS public.segmented_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES public.customer_groups(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one specific price per product per group
    CONSTRAINT unique_product_group_price UNIQUE(product_id, group_id)
);

ALTER TABLE public.segmented_prices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for segmented prices"
    ON public.segmented_prices FOR SELECT
    USING (true);

-- 4. Inserir dados Mock para teste no painel Admin
INSERT INTO public.customer_groups (name, discount_percent) 
VALUES ('Revendedor Ouro', 15.0), ('Atacadista Mock', 30.0)
ON CONFLICT DO NOTHING;
