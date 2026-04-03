# KingsHub

**Goal:** E-commerce definitivo para simuladores de corrida, construído para substituir a loja atual (Loja Integrada) e aumentar a conversão (meta: 2%+). A plataforma suporta operação nativa com 2 CNPJs, integrando ERP, emissão de NF dinâmica e um marketplace de usados.

**Architecture:** Frontend em Next.js 14 (App Router) comunicando-se com Supabase (Auth, Database, Storage). Integração direta com Mercado Pago (checkout transparente) e Olist (ERP bidirecional para estoque e pedidos).

**Tech Stack:**
- Next.js 14 (React)
- TypeScript (100% tipado)
- Supabase (PostgreSQL)
- Tailwind CSS v4 (Dark mode premium)
- Mercado Pago API
- Olist API
- Z-API (WhatsApp)
- Vitest (Testes)
