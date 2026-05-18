-- Migration: Criação da Tabela de Reputação e Avaliações de Mercado

CREATE TABLE public.seller_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
  order_id UUID NOT NULL REFERENCES public.orders(id),
  rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Um comprador não pode avaliar a mesma ordem duas vezes
  CONSTRAINT unique_review_per_order UNIQUE(reviewer_id, order_id)
);

-- Ativar segurança pesada (Ninguém lê nem insere por padrão)
ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

-- Políticas de Permissão

-- 1. Leitura: O PÚBLICO GERAL pode ver todos os reviews de qualquer vendedor (Pois constroem a vitrine online)
CREATE POLICY "Public reviews are viewable by everyone" 
ON public.seller_reviews FOR SELECT 
USING (true);

-- 2. Inserção: SOMENTE o comprador legítimo logado pode inserir sua experiência.
CREATE POLICY "Users can insert their own review tickets" 
ON public.seller_reviews FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = reviewer_id);

-- Para evitar dores de cabeça no RLS do Dashboard, Service Role (Admin) faz tudo.
-- Mas Service Role burla RLS automaticamente de qualquer forma via Postgres.
