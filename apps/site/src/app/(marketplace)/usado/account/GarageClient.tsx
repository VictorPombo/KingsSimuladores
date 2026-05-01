'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Package, ShoppingBag, User, ExternalLink, Clock, CheckCircle, XCircle, AlertCircle, FileText, Truck, Lock, Eye, EyeOff, MessageCircle, MessageSquare } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { ChatModal } from '@/components/marketplace/ChatModal'

type Listing = {
  id: string
  title: string
  price: number
  condition: string
  status: string
  images: string[]
  rejection_reason?: string
  created_at: string
}

type Order = {
  id: string
  total_price: number
  kings_fee: number
  seller_net: number
  status: string
  tracking_code?: string
  created_at: string
  listing: {
    title: string
    images: string[]
  }
  buyer: {
    full_name: string
  }
}

type UserProfile = {
  email: string
  full_name?: string
  created_at?: string
}

const STATUS_MAP: Record<string, { label: string, color: string, bg: string, icon: React.ReactNode }> = {
  pending_review: { label: 'Em Análise', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: <Clock size={14} /> },
  active: { label: 'Ativo', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: <CheckCircle size={14} /> },
  sold: { label: 'Vendido', color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', icon: <ShoppingBag size={14} /> },
  rejected: { label: 'Rejeitado', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: <XCircle size={14} /> },
}

const ORDER_STATUS_MAP: Record<string, { label: string, color: string }> = {
  pending_payment: { label: 'Aguardando Pagamento', color: '#f59e0b' },
  paid: { label: 'Pago', color: '#10b981' },
  shipped: { label: 'Enviado', color: '#06b6d4' },
  delivered: { label: 'Entregue', color: '#10b981' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
}

const CONDITION_MAP: Record<string, string> = {
  like_new: 'Seminovo',
  good: 'Bom',
  fair: 'Aceitável',
  novo: 'Novo',
}

export function GarageClient({
  listings,
  orders,
  profile,
}: {
  listings: Listing[]
  orders: Order[]
  profile: UserProfile
}) {
  const [activeTab, setActiveTab] = useState<'listings' | 'sales' | 'messages' | 'profile'>('listings')
  const [conversations, setConversations] = useState<any[]>([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [activeChat, setActiveChat] = useState<any | null>(null)

  React.useEffect(() => {
    if (activeTab === 'messages') {
      setLoadingChats(true)
      fetch('/api/messages/conversations')
        .then(res => res.json())
        .then(data => {
          if (data.conversations) setConversations(data.conversations)
          setLoadingChats(false)
        })
        .catch(() => setLoadingChats(false))
    }
  }, [activeTab])

  const activeListings = listings.filter(l => l.status === 'active' || l.status === 'pending_review')
  const soldListings = listings.filter(l => l.status === 'sold')
  const rejectedListings = listings.filter(l => l.status === 'rejected')

  const tabs = [
    { id: 'listings' as const, label: 'Meus Anúncios', icon: <Package size={16} />, count: listings.length },
    { id: 'sales' as const, label: 'Vendas Realizadas', icon: <ShoppingBag size={16} />, count: orders.length },
    { id: 'messages' as const, label: 'Mensagens', icon: <MessageCircle size={16} />, count: conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0) },
    { id: 'profile' as const, label: 'Meu Perfil', icon: <User size={16} />, count: 0 },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .garage-tab {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: rgba(15,18,30,0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px;
          color: #a1a1aa;
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        .garage-tab:hover { color: #fff; border-color: rgba(255,255,255,0.15); }
        .garage-tab.active {
          color: #8b5cf6;
          background: rgba(139, 92, 246, 0.08);
          border-color: rgba(139, 92, 246, 0.2);
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(139, 92, 246, 0.15);
        }
        .garage-card {
          transition: border-color 0.2s ease;
        }
        .garage-card:hover {
          border-color: rgba(255,255,255,0.15) !important;
        }
        @media (max-width: 768px) {
          .garage-tab { padding: 10px 14px; font-size: 0.8rem; }
          .garage-listing-row { flex-direction: column !important; align-items: flex-start !important; }
          .garage-listing-img { width: 100% !important; height: 160px !important; }
        }
      `}} />

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        overflowX: 'auto',
        paddingBottom: '8px'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`garage-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
            {tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,107,53,0.15)' : 'rgba(255,255,255,0.06)',
                color: activeTab === tab.id ? '#8b5cf6' : 'var(--text-muted)',
                fontSize: '0.7rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Meus Anúncios */}
      {activeTab === 'listings' && (
        <div>
          {listings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'rgba(15, 18, 30, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <Package size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.6, color: '#a1a1aa' }} />
              <p style={{ fontSize: '1rem', margin: '0 0 16px', color: '#e4e4e7' }}>Você ainda não anunciou nenhum equipamento.</p>
              <Link href="/usado/vender" style={{
                display: 'inline-block', padding: '12px 28px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6, #d946ef)', color: '#fff',
                textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                + Anunciar Grátis
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Ativos */}
              {activeListings.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 700, margin: '0 0 4px' }}>
                    Ativos ({activeListings.length})
                  </h3>
                  {activeListings.map(a => <ListingRow key={a.id} listing={a} />)}
                </>
              )}

              {/* Vendidos */}
              {soldListings.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 700, margin: '16px 0 4px' }}>
                    Vendidos ({soldListings.length})
                  </h3>
                  {soldListings.map(a => <ListingRow key={a.id} listing={a} />)}
                </>
              )}

              {/* Rejeitados */}
              {rejectedListings.length > 0 && (
                <>
                  <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 700, margin: '16px 0 4px' }}>
                    Rejeitados ({rejectedListings.length})
                  </h3>
                  {rejectedListings.map(a => <ListingRow key={a.id} listing={a} />)}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab: Mensagens */}
      {activeTab === 'messages' && (
        <div>
          {loadingChats ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>Carregando mensagens...</div>
          ) : conversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'rgba(15, 18, 30, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <MessageSquare size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.6, color: '#a1a1aa' }} />
              <p style={{ fontSize: '1rem', margin: 0, color: '#e4e4e7' }}>Nenhuma conversa ativa.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Quando um interessado mandar mensagem em seus produtos, aparecerá aqui.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {conversations.map((conv, idx) => (
                <div key={idx} onClick={() => setActiveChat(conv)} style={{
                  display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', cursor: 'pointer',
                  background: 'rgba(15, 18, 30, 0.6)', backdropFilter: 'blur(12px)',
                  border: conv.unread_count > 0 ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px', transition: 'border-color 0.2s'
                }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                    {conv.listing_image ? (
                      <img src={conv.listing_image} alt="Produto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Package size={24} color="#888" style={{ margin: '18px' }} />
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#fff', fontWeight: 700 }}>{conv.partner_name}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(conv.last_message_at).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#8b5cf6', fontWeight: 600, marginBottom: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Ref: {conv.listing_title}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: conv.unread_count > 0 ? '#fff' : 'var(--text-secondary)', fontWeight: conv.unread_count > 0 ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {conv.last_message}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <div style={{ background: 'var(--accent)', color: '#000', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                      {conv.unread_count}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal de Chat Ativo */}
      {activeChat && (
        <ChatModal
          listingId={activeChat.listing_id}
          listingTitle={activeChat.listing_title}
          listingPrice={0} 
          partnerId={activeChat.partner_id}
          partnerName={activeChat.partner_name}
          onClose={() => {
            setActiveChat(null)
            // Recarrega a lista para atualizar lidos
            fetch('/api/messages/conversations')
              .then(res => res.json())
              .then(data => { if (data.conversations) setConversations(data.conversations) })
          }}
        />
      )}

      {/* Tab: Vendas Realizadas */}
      {activeTab === 'sales' && (
        <div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', background: 'rgba(15, 18, 30, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px' }}>
              <ShoppingBag size={48} strokeWidth={1.5} style={{ marginBottom: '16px', opacity: 0.6, color: '#a1a1aa' }} />
              <p style={{ fontSize: '1rem', margin: 0, color: '#e4e4e7' }}>Nenhuma venda realizada ainda.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Quando alguém comprar um anúncio seu, a transação aparecerá aqui.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => {
                const status = ORDER_STATUS_MAP[order.status] || { label: order.status, color: '#888' }
                return (
                  <div key={order.id} className="garage-card" style={{
                    background: 'rgba(15, 18, 30, 0.6)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    padding: '20px',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: '200px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem',
                            fontWeight: 700, color: status.color,
                            background: `${status.color}15`, border: `1px solid ${status.color}30`,
                          }}>
                            {status.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(order.created_at).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: '0 0 4px' }}>
                          {order.listing?.title || 'Produto'}
                        </h3>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', margin: 0 }}>
                          Comprador: <span style={{ color: 'var(--text-secondary)' }}>{order.buyer?.full_name || 'Piloto'}</span>
                        </p>

                        {order.tracking_code ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.8rem', color: '#06b6d4' }}>
                            <Truck size={14} />
                            Rastreio: <code style={{ background: 'rgba(6,182,212,0.1)', padding: '2px 6px', borderRadius: '4px' }}>{order.tracking_code}</code>
                          </div>
                        ) : (
                          order.status === 'paid' && (
                            <div style={{ marginTop: '12px' }}>
                              <div style={{ fontSize: '0.75rem', color: '#f59e0b', marginBottom: '6px', fontWeight: 600 }}>Ação Pendente: Informe o envio</div>
                              <form onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const input = form.elements.namedItem('tracking') as HTMLInputElement;
                                if (!input.value) return;
                                
                                fetch(`/api/orders/${order.id}/tracking`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ tracking_code: input.value })
                                }).then(res => {
                                  if(res.ok) window.location.reload();
                                })
                              }} style={{ display: 'flex', gap: '8px' }}>
                                <input name="tracking" type="text" placeholder="Código de Rastreio (Ex: QP123456789BR)" style={{
                                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                  color: '#fff', padding: '8px 12px', borderRadius: '8px', fontSize: '0.8rem', outline: 'none', flex: 1
                                }} />
                                <button type="submit" style={{
                                  background: 'var(--accent)', color: '#000', border: 'none', padding: '8px 16px',
                                  borderRadius: '8px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer'
                                }}>Salvar</button>
                              </form>
                            </div>
                          )
                        )}
                      </div>

                      {/* Valores */}
                      <div style={{ textAlign: 'right', minWidth: '160px' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Valor total</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                          R$ {order.total_price?.toFixed(2)}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Comissão Kings: <span style={{ color: '#ef4444' }}>- R$ {order.kings_fee?.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                          Seu líquido: R$ {order.seller_net?.toFixed(2)}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <Link href={`/usado/comprovante/${order.id}`} style={{
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                        padding: '8px 16px', borderRadius: '8px', fontSize: '0.8rem',
                        fontWeight: 600, background: 'rgba(255,107,53,0.1)',
                        border: '1px solid rgba(255,107,53,0.2)', color: '#8b5cf6',
                        textDecoration: 'none', transition: 'background 0.2s',
                      }}>
                        <FileText size={14} />
                        Ver Comprovante
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Perfil */}
      {activeTab === 'profile' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '500px' }}>
          {/* Info Card */}
          <div style={{
            background: 'rgba(15, 18, 30, 0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '32px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
              <div style={{
                width: '56px', height: '56px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6, #d946ef)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontWeight: 800, color: '#fff',
              }}>
                {(profile.full_name || profile.email)?.[0]?.toUpperCase() || 'P'}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0 0 2px' }}>
                  {profile.full_name || 'Piloto'}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{profile.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Anúncios criados</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{listings.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Vendas realizadas</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>{orders.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Membro desde</span>
                <span style={{ color: '#fff', fontWeight: 700 }}>
                  {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Password Change Card */}
          <PasswordChangeForm />
        </div>
      )}
    </>
  )
}

// Sub-component: Password Change Form
function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (newPassword.length < 6) {
      setErrorMsg('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setStatus('loading')

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) {
        setErrorMsg(error.message)
        setStatus('error')
      } else {
        setStatus('success')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => setStatus('idle'), 4000)
      }
    } catch {
      setErrorMsg('Erro inesperado. Tente novamente.')
      setStatus('error')
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 40px 12px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  }

  return (
    <div style={{
      background: 'rgba(15, 18, 30, 0.6)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      padding: '32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <Lock size={18} color="#8b5cf6" />
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
          Alterar Senha
        </h3>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
            Nova senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}
            >
              {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>
            Confirmar nova senha
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#71717a', padding: 0 }}
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {errorMsg && (
          <div style={{ fontSize: '0.82rem', color: '#ef4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
            {errorMsg}
          </div>
        )}

        {status === 'success' && (
          <div style={{ fontSize: '0.82rem', color: '#10b981', background: 'rgba(16,185,129,0.08)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={14} /> Senha alterada com sucesso!
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !newPassword || !confirmPassword}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '10px',
            border: 'none',
            background: status === 'loading' ? 'rgba(139,92,246,0.3)' : 'linear-gradient(135deg, #8b5cf6, #d946ef)',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            transition: 'opacity 0.2s',
            opacity: (!newPassword || !confirmPassword) ? 0.5 : 1,
          }}
        >
          {status === 'loading' ? 'Alterando...' : 'Salvar Nova Senha'}
        </button>
      </form>
    </div>
  )
}

// Sub-component: Listing Row
function ListingRow({ listing }: { listing: Listing }) {
  const s = STATUS_MAP[listing.status] || { label: listing.status, color: '#888', bg: 'rgba(255,255,255,0.05)', icon: <AlertCircle size={14} /> }
  const imgUrl = listing.images?.[0]

  return (
    <div className="garage-card" style={{
      background: 'rgba(15, 18, 30, 0.6)',
      backdropFilter: 'blur(12px)',
      border: listing.status === 'rejected' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.08)',
      borderRadius: '12px',
      overflow: 'hidden',
    }}>
      <div className="garage-listing-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Thumb */}
        <div className="garage-listing-img" style={{
          width: '100px', height: '100px', flexShrink: 0,
          background: imgUrl ? '#fff' : 'rgba(255,255,255,0.04)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {imgUrl ? (
            <img src={imgUrl} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
          ) : (
            <Package size={32} color="var(--text-muted)" />
          )}
        </div>

        {/* Info */}
        <div style={{ flex: 1, padding: '16px 16px 16px 0', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              padding: '3px 10px', borderRadius: '6px', fontSize: '0.72rem',
              fontWeight: 700, color: s.color, background: s.bg,
              border: `1px solid ${s.color}30`,
            }}>
              {s.icon} {s.label}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {CONDITION_MAP[listing.condition] || listing.condition}
            </span>
          </div>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {listing.title}
          </h4>
          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#8b5cf6' }}>
            R$ {listing.price?.toFixed(2)}
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: '16px', flexShrink: 0 }}>
          <Link href={`/usado/produto/${listing.id}`} style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '6px 12px', borderRadius: '6px', fontSize: '0.78rem',
            fontWeight: 600, color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)',
            textDecoration: 'none', background: 'transparent', transition: 'all 0.2s',
          }}>
            <ExternalLink size={12} /> Ver
          </Link>
        </div>
      </div>

      {listing.status === 'rejected' && listing.rejection_reason && (
        <div style={{
          padding: '12px 20px', borderTop: '1px solid rgba(239,68,68,0.15)',
          background: 'rgba(239,68,68,0.05)', fontSize: '0.85rem', color: '#ef4444',
        }}>
          <strong>Motivo:</strong> {listing.rejection_reason}
        </div>
      )}
    </div>
  )
}
