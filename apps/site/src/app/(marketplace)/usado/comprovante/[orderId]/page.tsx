// @ts-nocheck
import React from 'react'
import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { redirect, notFound } from 'next/navigation'
import { PrintButton } from './PrintButton'

export const dynamic = 'force-dynamic'

export default async function ComprovantePage({ params }: { params: { orderId: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/usado/login')
  }

  // Buscar order
  const { data: order } = await supabase
    .from('marketplace_orders')
    .select('*')
    .eq('id', params.orderId)
    .single()

  if (!order) return notFound()

  // Verificar que o user é vendedor ou comprador
  if (order.seller_id !== user.id && order.buyer_id !== user.id) {
    return notFound()
  }

  // Buscar listing
  const { data: listing } = await supabase
    .from('marketplace_listings')
    .select('title, images, condition, description')
    .eq('id', order.listing_id)
    .single()

  // Buscar perfis
  const { data: seller } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', order.seller_id)
    .single()

  const { data: buyer } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', order.buyer_id)
    .single()

  const CONDITION_MAP: Record<string, string> = {
    like_new: 'Seminovo (Na caixa)',
    good: 'Bom (Marcas sutis de uso)',
    fair: 'Aceitável (Marcas pesadas)',
    novo: 'Novo (Lacrado)',
  }

  const receiptDate = new Date(order.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '80px' }}>
      <Container style={{ maxWidth: '700px' }}>
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            nav, header, footer, .no-print { display: none !important; }
            body { background: #fff !important; color: #000 !important; }
            .receipt-card { box-shadow: none !important; border: 1px solid #ddd !important; background: #fff !important; }
            .receipt-card * { color: #000 !important; }
          }
        `}} />

        {/* Botões de ação */}
        <div className="no-print" style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <a href="/usado/account" style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem',
            fontWeight: 600, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none',
          }}>
            ← Voltar à Garagem
          </a>
          <PrintButton />
        </div>

        {/* Comprovante */}
        <div className="receipt-card" style={{
          background: 'rgba(15, 18, 30, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}>
          {/* Header do comprovante */}
          <div style={{
            background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
            padding: '32px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '3px', marginBottom: '4px' }}>
              MSU — MEU SIMULADOR USADO
            </div>
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              Comprovante de Transação
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: '32px' }}>
            {/* Meta */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
              paddingBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)',
              marginBottom: '24px',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Nº da Transação</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', fontFamily: 'monospace', marginTop: '4px' }}>
                  {order.id.split('-')[0].toUpperCase()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Data</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {receiptDate}
                </div>
              </div>
            </div>

            {/* Produto */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '12px' }}>
                Produto
              </div>
              <div style={{
                display: 'flex', gap: '16px', alignItems: 'center',
                background: 'rgba(255,255,255,0.03)', padding: '16px',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)',
              }}>
                {listing?.images?.[0] && (
                  <img src={listing.images[0]} alt="" style={{
                    width: '72px', height: '72px', borderRadius: '8px', objectFit: 'contain',
                    background: '#fff', padding: '4px',
                  }} />
                )}
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{listing?.title || 'Produto'}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Estado: {CONDITION_MAP[listing?.condition] || listing?.condition || '—'}
                  </div>
                </div>
              </div>
            </div>

            {/* Partes */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px',
              marginBottom: '24px', paddingBottom: '24px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px' }}>
                  Vendedor
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                  {seller?.full_name || 'Piloto Vendedor'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '8px' }}>
                  Comprador
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff' }}>
                  {buyer?.full_name || 'Piloto Comprador'}
                </div>
              </div>
            </div>

            {/* Valores */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 700, marginBottom: '16px' }}>
                Detalhamento Financeiro
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Valor do produto</span>
                  <span style={{ color: '#fff', fontWeight: 600 }}>R$ {order.total_price?.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Comissão Kings ({order.commission_rate}%)</span>
                  <span style={{ color: '#ef4444', fontWeight: 600 }}>- R$ {order.kings_fee?.toFixed(2)}</span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                  <span style={{ color: '#fff', fontWeight: 700 }}>Valor líquido do vendedor</span>
                  <span style={{ color: '#10b981', fontWeight: 800 }}>R$ {order.seller_net?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Rastreio */}
            {order.tracking_code && (
              <div style={{
                background: 'rgba(6,182,212,0.05)', padding: '14px 16px', borderRadius: '10px',
                border: '1px solid rgba(6,182,212,0.15)', marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '0.82rem', color: '#06b6d4' }}>🚚 Código de Rastreio:</span>
                <code style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{order.tracking_code}</code>
              </div>
            )}

            {/* Footer */}
            <div style={{
              textAlign: 'center', paddingTop: '24px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              color: 'var(--text-muted)', fontSize: '0.75rem',
              lineHeight: 1.6,
            }}>
              Este documento é um comprovante de transação emitido pela plataforma<br />
              <strong style={{ color: 'var(--text-secondary)' }}>Meu Simulador Usado — KingsHub</strong><br />
              e não substitui uma nota fiscal eletrônica (NF-e).
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
