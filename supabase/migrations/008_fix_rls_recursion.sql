-- Corrige o problema de recursividade infinita (infinite recursion) na tabela profiles
-- causado por uma regra de segurança (RLS) que consultava a própria tabela gerando um loop infinito.

-- Remove a política antiga
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;

-- Cria a política nova sem recursividade: 
-- (usuários normais só leem o próprio perfil; admins usam o Service Role para ler tudo no backend)
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (
  auth_id = auth.uid()
);
