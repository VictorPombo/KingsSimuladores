-- Esse script vincula TODOS os administradores ao grupo "Volantes" para efeito de teste.
-- Rode isso no SQL Editor do Supabase!

UPDATE public.profiles
SET customer_group_id = (
    SELECT id FROM public.customer_groups 
    WHERE name ILIKE '%Volantes%' 
    LIMIT 1
)
WHERE is_admin = true; -- Assumindo que você seja admin, ou simplesmente rode para todos se preferir:
-- WHERE id IS NOT NULL; (Se quiser forçar TODO MUNDO a ser do grupo volantes para testar)
