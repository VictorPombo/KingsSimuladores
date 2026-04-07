-- ═══════════════════════════════════════════
-- Módulo de Cupons - Fase 06
-- Adiciona políticas RLS para proteção da tabela de cupons
-- ═══════════════════════════════════════════

-- Habilitar RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Admins podem fazer tudo (CRUD completo pelo painel administrativo)
CREATE POLICY "coupons_admin_all" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles p WHERE p.auth_id = auth.uid() AND p.role = 'admin')
);

-- NOTA IMPORTANTÍSSIMA SOBRE SEGURANÇA:
-- Não estamos incluindo nenhuma Policy "SELECT" pública (client / anon) aqui!
-- Isso é deliberado para "esconder" a tabela de cupons via Supabase Client padrão.
-- A validação de cupons será realizada através do backend do Next.js (Server Actions API)
-- usando a 'SUPABASE_SERVICE_ROLE_KEY' (bypass-RLS) para evitar que usuários maliciosos 
-- listem o catálogo completo de códigos da tabela chamando a API do PostgREST.
