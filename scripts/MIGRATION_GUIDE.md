# ═══════════════════════════════════════════════════════
# MIGRAÇÃO DE DADOS — Kings Simuladores
# ═══════════════════════════════════════════════════════
#
# Este arquivo é um lembrete dos passos para a migração.
# Nenhum destes passos afeta a loja antiga (Loja Integrada).
#
# ── PASSO 1: Exportar dados da Loja Integrada ──────────
# 1. Acessar admin da Loja Integrada
# 2. Ir em Produtos → Exportar → CSV
# 3. Salvar como: scripts/produtos_loja_integrada.csv
#
# ── PASSO 2: Rodar o script de migração ────────────────
# npx dotenv -e .env.local -- tsx scripts/migrate-products.ts
#
# ── PASSO 3: Verificar no Supabase ────────────────────
# Abrir Supabase Dashboard → Table Editor → products
# Confirmar que os produtos foram importados corretamente
#
# ── PASSO 4 (OPCIONAL): Migrar dados do MSU/Firebase ──
# Caso o MSU tenha dados no Firebase, criar script similar
# Script: scripts/migrate-msu-listings.ts
#
# ═══════════════════════════════════════════════════════
# ⚠️  O DNS SÓ será trocado quando TUDO estiver validado.
#     A loja antiga continua no ar até a decisão final.
# ═══════════════════════════════════════════════════════
