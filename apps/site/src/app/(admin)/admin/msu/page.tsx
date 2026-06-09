import React from 'react'
import { createAdminClient } from '@kings/db'
import Link from 'next/link'
import {
  ShoppingBag, DollarSign, Users, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle, Package,
  ArrowRight, BarChart3
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MsuDashboardPage() {
  const supabase = createAdminClient()

  // Fetch all listings
  const { data: listings } = await supabase
    .from('marketplace_listings')
    .select('id, status, price, seller_id, created_at, is_boosted')

  // Fetch all marketplace orders
  const { data: orders } = await supabase
    .from('marketplace_orders')
    .select('id, total_price, kings_fee, seller_net, status, created_at')

  // Fetch unique sellers count
  const { data: sellers } = await supabase
    .from('marketplace_listings')
    .select('seller_id')

  const allListings = listings || []
  const allOrders = orders || []
  const uniqueSellers = new Set((sellers || []).map((s: any) => s.seller_id)).size

  // KPIs
  const totalListings = allListings.length
  const activeListings = allListings.filter(l => l.status === 'active').length
  const pendingListings = allListings.filter(l => l.status === 'pending_review').length
  const soldListings = allListings.filter(l => l.status === 'sold').length
  const rejectedListings = allListings.filter(l => l.status === 'rejected').length
  const boostedListings = allListings.filter(l => l.is_boosted).length

  const totalRevenue = allOrders.reduce((sum, o: any) => sum + (o.total_price || 0), 0)
  const totalCommission = allOrders.reduce((sum, o: any) => sum + (o.kings_fee || 0), 0)
  const totalPending = allOrders
    .filter((o: any) => o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((sum, o: any) => sum + (o.seller_net || 0), 0)
  const avgTicket = allOrders.length > 0 ? totalRevenue / allOrders.length : 0

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  // Últimos 5 anúncios pendentes
  const recentPending = allListings
    .filter(l => l.status === 'pending_review')
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <BarChart3 size={28} color="#06b6d4" /> Dashboard MSU
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '0' }}>Visão geral do Meu Simulador Usado — métricas em tempo real.</p>
      </div>

      {/* Alerta de pendentes */}
      {pendingListings > 0 && (
        <Link href="/admin/msu-anuncios" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.03))',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px', padding: '16px 24px', marginBottom: '24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            cursor: 'pointer', transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={22} color="#f59e0b" />
              <div>
                <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                  {pendingListings} anúncio{pendingListings > 1 ? 's' : ''} aguardando moderação
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '2px' }}>
                  Clique para revisar e aprovar/rejeitar
                </div>
              </div>
            </div>
            <ArrowRight size={18} color="#f59e0b" />
          </div>
        </Link>
      )}

      {/* KPIs Grid - Anúncios */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Anúncios</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'Total', value: totalListings, color: '#06b6d4', Icon: ShoppingBag },
          { label: 'Ativos', value: activeListings, color: '#10b981', Icon: CheckCircle },
          { label: 'Pendentes', value: pendingListings, color: '#f59e0b', Icon: Clock },
          { label: 'Vendidos', value: soldListings, color: '#3b82f6', Icon: Package },
          { label: 'Rejeitados', value: rejectedListings, color: '#ef4444', Icon: XCircle },
          { label: 'Vendedores', value: uniqueSellers, color: '#8b5cf6', Icon: Users },
        ].map((k, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', borderRadius: '12px', padding: '18px',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.Icon size={18} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* KPIs Grid - Financeiro */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Financeiro</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '28px' }}>
        {[
          { label: 'GMV (Volume Vendas)', value: fmt(totalRevenue), color: '#10b981', Icon: TrendingUp },
          { label: 'Comissão Kings', value: fmt(totalCommission), color: '#f59e0b', Icon: DollarSign },
          { label: 'Repasses Pendentes', value: fmt(totalPending), color: '#ef4444', Icon: Clock },
          { label: 'Ticket Médio', value: fmt(avgTicket), color: '#06b6d4', Icon: BarChart3 },
        ].map((k, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)', borderRadius: '12px', padding: '18px',
            border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '14px'
          }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <k.Icon size={18} color={k.color} />
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{k.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <h3 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Acesso Rápido</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {[
          { href: '/admin/msu-anuncios', label: 'Anúncios & Moderação', desc: 'Aprovar, rejeitar e gerenciar classificados', icon: ShoppingBag, color: '#06b6d4' },
          { href: '/admin/msu-pedidos', label: 'Pedidos & Escrow', desc: 'Transações P2P e liberação de retenções', icon: Package, color: '#3b82f6' },
          { href: '/admin/msu-comissoes', label: 'Comissões & Repasses', desc: 'Reconciliação financeira do marketplace', icon: DollarSign, color: '#10b981' },
          { href: '/admin/msu-vendedores', label: 'Vendedores', desc: 'Gestão de perfis de vendedores', icon: Users, color: '#8b5cf6' },
        ].map((link, i) => (
          <Link key={i} href={link.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: 'var(--bg-card)', borderRadius: '12px', padding: '20px',
              border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '16px',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={(e: any) => e.currentTarget.style.borderColor = link.color}
              onMouseLeave={(e: any) => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: `${link.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <link.icon size={20} color={link.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{link.label}</div>
                <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{link.desc}</div>
              </div>
              <ArrowRight size={16} color="#3f424d" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
