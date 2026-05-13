-- 1. Add views to products
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;
CREATE INDEX IF NOT EXISTS products_views_idx ON public.products (views DESC);

-- 2. Create site_visits table
CREATE TABLE IF NOT EXISTS public.site_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  origin TEXT NOT NULL, -- 'kings' or 'msu'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS for site_visits
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts to site_visits" ON public.site_visits
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to site_visits" ON public.site_visits
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.auth_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 3. RPC to increment product views atomically
CREATE OR REPLACE FUNCTION increment_product_views(p_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET views = views + 1
  WHERE id = p_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. RPC to get unique visits per day (last N days)
CREATE OR REPLACE FUNCTION get_visitas_por_dia(dias INTEGER)
RETURNS TABLE (dia DATE, unique_visits BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    DATE(created_at AT TIME ZONE 'America/Sao_Paulo') as dia,
    COUNT(DISTINCT session_id) as unique_visits
  FROM public.site_visits
  WHERE created_at >= NOW() - (dias || ' days')::interval
  GROUP BY dia
  ORDER BY dia ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
