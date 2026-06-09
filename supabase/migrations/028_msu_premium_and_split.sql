-- Migração: Adicionar configurações do sistema (Split Fernando) e Destaque de Anúncio (Bumped At)

-- 1. Tabela para configurações gerais do sistema
CREATE TABLE IF NOT EXISTS public.system_settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Public read access to system_settings"
  ON public.system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admin full access to system_settings"
  ON public.system_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.auth_id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2. Inserir a chave inicial para o Split do Fernando (Padrão inicial: 50% da taxa Kings)
INSERT INTO public.system_settings (key, value)
VALUES ('msu_fernando_split_percent', '50'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 3. Adicionar coluna bumped_at nos produtos e marketplace_listings para o Upsell de R$ 30
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.marketplace_listings ADD COLUMN IF NOT EXISTS bumped_at TIMESTAMP WITH TIME ZONE;
