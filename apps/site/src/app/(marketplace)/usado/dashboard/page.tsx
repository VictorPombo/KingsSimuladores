'use client'

import React, { useEffect, useState } from 'react'
import { Container, Button } from '@kings/ui'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'
import { Package, DollarSign, Clock, CheckCircle, Ban } from 'lucide-react'

// Typing helpers
type Product = {
  id: string
  title: string
  price: number
  status: string
  created_at: string
  images: string[]
}

type Payout = {
  id: string
  gross_amount: number
  platform_fee_amount: number
  net_amount: number
  status: 'held' | 'available' | 'paid' | 'refunded'
  tracking_code?: string
  created_at: string
  order_item: {
    products: {
      title: string
    }
  }
}

export default function VendedorDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') === 'finance' ? 'finance' : 'ads'
  
  const [activeTab, setActiveTab] = useState<'ads' | 'finance'>(defaultTab as 'ads' | 'finance')
  const [loading, setLoading] = useState(true)
  
  const [ads, setAds] = useState<Product[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])

  useEffect(() => {
    const fetchDashboardData = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        router.push('/usado/login')
        return
      }

      // Fetch Ads
      const { data: adsData } = await supabase
        .from('products')
        .select('id, title, price, status, created_at, images')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false })

      if (adsData) setAds(adsData)

      // Fetch Finances
      // Note: order_item:order_items(product:products(title)) syntax in Supabase JS:
      const { data: payoutsData } = await supabase
        .from('payouts')
        .select(`
          id, gross_amount, platform_fee_amount, net_amount, status, tracking_code, created_at,
          order_item:order_items( product:products(title) )
        `)
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false })

      if (payoutsData) {
          // Format the deeply nested response gracefully
          const formattedPayouts = payoutsData.map((p: any) => ({
              ...p,
              order_item: {
                  products: { title: p.order_item?.product?.title || 'Produto Desconhecido' }
              }
          }))
          setPayouts(formattedPayouts)
      }

      setLoading(false)
    }

    fetchDashboardData()
  }, [router, searchParams])

  // Cálculos Financeiros
  const saldoRetido = payouts.filter(p => p.status === 'held').reduce((acc, p) => acc + Number(p.net_amount), 0)
  const saldoDisponivel = payouts.filter(p => p.status === 'available').reduce((acc, p) => acc + Number(p.net_amount), 0)
  const totalSacado = payouts.filter(p => p.status === 'paid').reduce((acc, p) => acc + Number(p.net_amount), 0)

  const handleSaque = () => {
    alert("Solicitação enviada! O PIX será processado em até 2 dias úteis.")
  }

  const handleSendTracking = async (payoutId: string) => {
    const input = document.getElementById(`track-${payoutId}`) as HTMLInputElement
    const trackingCode = input?.value?.trim()
    if (!trackingCode) return alert('Digite o código de rastreio.')

    try {
      const res = await fetch('/api/vender/rastreio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId, trackingCode })
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Erro ao salvar rastreio')
      }
      
      setPayouts(prev => prev.map(p => p.id === payoutId ? { ...p, tracking_code: trackingCode } : p))
      alert('Rastreio salvo e comprador notificado com sucesso!')
    } catch(e: any) {
      alert(e.message)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#E8002D', fontWeight: 'bold' }}>Carregando Paddock...</div>
      </div>
    )
  }

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', color: '#fff' }}>
      <Container>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.5px' }}>Painel do Vendedor</h1>
              <p style={{ color: '#a1a1aa' }}>Gerencie seus classificados e acompanhe seus ganhos.</p>
            </div>
            <Button onClick={() => router.push('/usado/vender')} style={{ background: '#E8002D', color: '#fff', border: 'none', fontWeight: 700 }}>
              + Novo Anúncio
            </Button>
          </div>

          {/* Abas de Navegação */}
          <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '2rem' }}>
            <button 
              onClick={() => { setActiveTab('ads'); router.replace('/usado/dashboard?tab=ads') }}
              style={{ 
                background: 'transparent', border: 'none', padding: '1rem 0', color: activeTab === 'ads' ? '#E8002D' : '#71717a', 
                fontWeight: 700, borderBottom: activeTab === 'ads' ? '2px solid #E8002D' : '2px solid transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              <Package size={18} /> Meus Anúncios
            </button>
            <button 
              onClick={() => { setActiveTab('finance'); router.replace('/usado/dashboard?tab=finance') }}
              style={{ 
                background: 'transparent', border: 'none', padding: '1rem 0', color: activeTab === 'finance' ? '#E8002D' : '#71717a', 
                fontWeight: 700, borderBottom: activeTab === 'finance' ? '2px solid #E8002D' : '2px solid transparent', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
              }}
            >
              <DollarSign size={18} /> Financeiro e Repasses
            </button>
          </div>

          {/* ABA: ANÚNCIOS */}
          {activeTab === 'ads' && (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {ads.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#111', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#71717a', marginBottom: '1rem' }}>Você ainda não tem nenhum anúncio.</p>
                  <Button onClick={() => router.push('/usado/vender')} style={{ background: '#333', color: '#fff', border: '1px solid #555' }}>Começar a Vender</Button>
                </div>
              ) : (
                ads.map(ad => (
                  <div key={ad.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', background: '#111', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '8px', overflow: 'hidden', background: '#222' }}>
                      {ad.images?.[0] && <img src={ad.images[0]} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>{ad.title}</h3>
                      <div style={{ fontWeight: 800, color: '#e4e4e7' }}>R$ {Number(ad.price).toFixed(2).replace('.', ',')}</div>
                      <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '4px' }}>
                        Adicionado em: {new Date(ad.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    <div>
                      {ad.status === 'pending_review' && <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(234, 179, 8, 0.1)', color: '#eab308', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14}/> Em Análise</span>}
                      {ad.status === 'active' && <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><CheckCircle size={14}/> Ativo</span>}
                      {(ad.status === 'sold' || ad.status === 'inactive') && <span style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(113, 113, 122, 0.1)', color: '#71717a', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}><Ban size={14}/> {ad.status === 'sold' ? 'Vendido' : 'Inativo'}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABA: FINANCEIRO */}
          {activeTab === 'finance' && (
            <div>
              {/* Cards de Resumo */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>Saldo Retido (Garantia)</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#eab308' }}>R$ {saldoRetido.toFixed(2).replace('.', ',')}</div>
                </div>
                
                <div style={{ background: 'rgba(232,0,45,0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(232,0,45,0.2)', position: 'relative' }}>
                  <div style={{ color: '#E8002D', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 700 }}>Disponível para Saque</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>R$ {saldoDisponivel.toFixed(2).replace('.', ',')}</div>
                  <Button 
                    onClick={handleSaque}
                    disabled={saldoDisponivel <= 0}
                    style={{ width: '100%', background: saldoDisponivel > 0 ? '#E8002D' : '#333', color: saldoDisponivel > 0 ? '#fff' : '#777', border: 'none', fontWeight: 700, padding: '10px' }}
                  >
                    Solicitar Saque via PIX
                  </Button>
                </div>

                <div style={{ background: '#111', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ color: '#71717a', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 600 }}>Total Sacado</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#22c55e' }}>R$ {totalSacado.toFixed(2).replace('.', ',')}</div>
                </div>
              </div>

              {/* Tabela de Extrato */}
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Extrato de Repasses</h3>
              <div style={{ background: '#111', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                {payouts.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#71717a' }}>Nenhuma venda registrada ainda.</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <th style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Data</th>
                        <th style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Produto</th>
                        <th style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Valor Bruto</th>
                        <th style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Líquido (Você recebe)</th>
                        <th style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Status</th>
                        <th style={{ padding: '1rem', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase' }}>Logística</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payouts.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                          <td style={{ padding: '1rem', color: '#e4e4e7', fontSize: '0.9rem' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                          <td style={{ padding: '1rem', color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>{p.order_item.products?.title}</td>
                          <td style={{ padding: '1rem', color: '#71717a', fontSize: '0.9rem' }}>R$ {Number(p.gross_amount).toFixed(2).replace('.', ',')}</td>
                          <td style={{ padding: '1rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem' }}>R$ {Number(p.net_amount).toFixed(2).replace('.', ',')}</td>
                          <td style={{ padding: '1rem' }}>
                            {p.status === 'held' && <span style={{ color: '#eab308', fontSize: '0.8rem', fontWeight: 700 }}>Retido</span>}
                            {p.status === 'available' && <span style={{ color: '#E8002D', fontSize: '0.8rem', fontWeight: 700 }}>Disponível</span>}
                            {p.status === 'paid' && <span style={{ color: '#22c55e', fontSize: '0.8rem', fontWeight: 700 }}>Pago</span>}
                            {p.status === 'refunded' && <span style={{ color: '#71717a', fontSize: '0.8rem', fontWeight: 700 }}>Reembolsado</span>}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            {p.status === 'held' && !p.tracking_code && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input 
                                  type="text" 
                                  placeholder="Cód. Rastreio"
                                  id={`track-${p.id}`}
                                  style={{ padding: '6px', background: '#222', border: '1px solid #333', color: '#fff', borderRadius: '4px', width: '120px', fontSize: '0.8rem' }}
                                />
                                <button 
                                  onClick={() => handleSendTracking(p.id)}
                                  style={{ background: '#E8002D', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}
                                >
                                  Salvar
                                </button>
                              </div>
                            )}
                            {p.tracking_code && (
                              <div style={{ color: '#22c55e', fontSize: '0.85rem', fontWeight: 700 }}>
                                ✅ Enviado:<br/> <span style={{color: '#fff'}}>{p.tracking_code}</span>
                              </div>
                            )}
                            {p.status !== 'held' && !p.tracking_code && (
                              <span style={{ color: '#71717a', fontSize: '0.8rem' }}>N/A</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

        </div>
      </Container>
    </div>
  )
}
