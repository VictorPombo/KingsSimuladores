-- Tabela de Fila de Espera (Waitlist / Avise-me)
CREATE TABLE public.waitlist (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified')),
  created_at timestamptz NOT NULL DEFAULT now(),
  notified_at timestamptz
);

-- Habilitar RLS
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
-- Qualquer um pode inserir na fila de espera (público)
CREATE POLICY "Public can insert into waitlist" ON public.waitlist
  FOR INSERT WITH CHECK (true);

-- Apenas admins podem ler/atualizar/deletar
CREATE POLICY "Admins can view waitlist" ON public.waitlist
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update waitlist" ON public.waitlist
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete waitlist" ON public.waitlist
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Comentários para documentação
COMMENT ON TABLE public.waitlist IS 'Lista de espera (Avise-me quando chegar) para produtos esgotados.';
COMMENT ON COLUMN public.waitlist.customer_phone IS 'WhatsApp do cliente higienizado no formato 55DDDNUMERO.';
