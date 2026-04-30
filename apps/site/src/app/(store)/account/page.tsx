import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Container, Button } from '@kings/ui'
import { formatPrice } from '@kings/utils'
import { OrderStatusBadge } from '@/components/store/account/OrderStatusBadge'
import { 
  Package, 
  MapPin, 
  LogOut, 
  User, 
  ShoppingBag, 
  FileText, 
  Headset, 
  Clock,
  Settings,
  ShieldCheck,
  Bell,
  Smartphone,
  Plus,
  Home,
  CreditCard
} from 'lucide-react'
import { ProfileForm, AddressManager, SecurityForm } from './ClientForms'

export const dynamic = 'force-dynamic'

export default async function AccountPage({ searchParams }: { searchParams: { order?: string, tab?: string } }) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Buscar profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  // Fetch orders
  const { data: orders } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_id', profile?.id || user.id)
    .order('created_at', { ascending: false })

  const displayOrders = orders && orders.length > 0 ? orders : [
    {
      id: searchParams.order || 'mock-order-id-123',
      created_at: new Date().toISOString(),
      status: 'paid',
      total: 3950.00,
      tracking_code: 'BR123456789XX',
    }
  ]

  const userName = (profile as any)?.full_name || 'Piloto Kings'
  const userInitials = userName.substring(0, 2).toUpperCase()
  const totalSpent = displayOrders.reduce((acc: number, o: any) => acc + (o.total || 0), 0)
  
  const currentTab = searchParams.tab || 'pedidos'

  // --- COMPONENTES AUXILIARES DE UI ---
  const InputField = ({ label, placeholder, type = "text", value = "", disabled = false }: any) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        defaultValue={value}
        disabled={disabled}
        style={{
          background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.75rem',
          padding: '12px 16px',
          color: disabled ? '#64748b' : '#fff',
          outline: 'none',
          fontSize: '0.95rem',
          transition: 'border 0.2s',
          cursor: disabled ? 'not-allowed' : 'text'
        }} 
        className="focus:border-[#00e5ff]"
      />
    </div>
  )

  const ToggleSwitch = ({ label, description, defaultChecked }: any) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#e2e8f0' }}>{label}</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>{description}</div>
      </div>
      <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
        <input type="checkbox" defaultChecked={defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} />
        <span style={{ 
          position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
          background: defaultChecked ? '#10b981' : 'rgba(255,255,255,0.1)', 
          borderRadius: '34px', transition: '0.4s' 
        }}>
          <span style={{ 
            position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px', 
            backgroundColor: 'white', borderRadius: '50%', transition: '0.4s',
            transform: defaultChecked ? 'translateX(20px)' : 'translateX(0)'
          }}></span>
        </span>
      </label>
    </div>
  )

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', color: '#fff' }}>
      <Container>
        
        <style dangerouslySetInnerHTML={{__html: `
          .nav-item {
            display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px;
            color: #94a3b8; text-decoration: none; font-weight: 600; font-size: 0.95rem;
            transition: all 0.2s ease; cursor: pointer; border: 1px solid transparent;
          }
          .nav-item:hover {
            background: rgba(255,255,255,0.05); color: #fff;
          }
          .nav-item.active {
            background: rgba(0, 229, 255, 0.1); color: #00e5ff; border: 1px solid rgba(0, 229, 255, 0.2);
          }
          .card-panel {
            background: rgba(10, 14, 26, 0.8); backdrop-filter: blur(16px);
            border: 1px solid rgba(255,255,255,0.08); border-radius: 1.25rem;
            padding: 2rem;
          }
          .order-card {
            transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
          }
          .order-card:hover {
            transform: translateY(-2px);
            border-color: rgba(0, 229, 255, 0.3);
            box-shadow: 0 10px 30px -10px rgba(0, 229, 255, 0.15);
          }
          .action-btn {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            transition: all 0.2s ease;
          }
          .action-btn:hover {
            filter: brightness(1.2);
          }
          @media (max-width: 900px) {
            .dashboard-layout {
              grid-template-columns: 1fr !important;
            }
          }
        `}} />

        <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2.5rem', alignItems: 'start' }}>
          
          {/* SIDEBAR */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'sticky', top: '100px' }}>
            
            {/* Perfil Header */}
            <div className="card-panel" style={{ padding: '2rem 1.5rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #00e5ff, #10b981)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, color: '#fff',
                marginBottom: '1rem', boxShadow: '0 0 20px rgba(0, 229, 255, 0.3)'
              }}>
                {userInitials}
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>{userName}</h2>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>{user.email}</p>
              <div style={{ marginTop: '1.25rem', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 5px #10b981' }}></span>
                Conta Ativa
              </div>
            </div>

            {/* Menu Nav */}
            <div className="card-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <Link href="?tab=pedidos" className={`nav-item ${currentTab === 'pedidos' ? 'active' : ''}`}>
                <Package size={18} /> Meus Pedidos
              </Link>
              <Link href="?tab=dados" className={`nav-item ${currentTab === 'dados' ? 'active' : ''}`}>
                <User size={18} /> Meus Dados
              </Link>
              <Link href="?tab=enderecos" className={`nav-item ${currentTab === 'enderecos' ? 'active' : ''}`}>
                <MapPin size={18} /> Endereços
              </Link>
              <Link href="?tab=seguranca" className={`nav-item ${currentTab === 'seguranca' ? 'active' : ''}`}>
                <ShieldCheck size={18} /> Segurança
              </Link>
            </div>

            {/* Ações Rápidas */}
            <div className="card-panel" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column' }}>
               <button className="nav-item" style={{ width: '100%', background: 'transparent', border: '1px solid transparent', textAlign: 'left', color: '#f87171' }}>
                 <LogOut size={18} /> Sair da Conta
               </button>
            </div>
            
          </aside>

          {/* MAIN CONTENT */}
          <main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header / Resumo */}
            <div>
              <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                {currentTab === 'pedidos' && 'Histórico de Pedidos'}
                {currentTab === 'dados' && 'Meus Dados Pessoais'}
                {currentTab === 'enderecos' && 'Endereços de Entrega'}
                {currentTab === 'seguranca' && 'Segurança e Privacidade'}
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
                {currentTab === 'pedidos' && 'Acompanhe o status das suas compras.'}
                {currentTab === 'dados' && 'Gerencie as informações da sua conta e dados de contato.'}
                {currentTab === 'enderecos' && 'Adicione ou remova endereços para facilitar no checkout.'}
                {currentTab === 'seguranca' && 'Altere senhas e gerencie suas preferências de notificação.'}
              </p>
            </div>

            {/* VIEWS BASEADAS NA ABA */}
            {currentTab === 'pedidos' && (
              <>
                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                  <div style={{ background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.1), rgba(10, 14, 26, 0.9))', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>
                      <ShoppingBag size={18} /> Pedidos Realizados
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{displayOrders.length}</div>
                  </div>

                  <div style={{ background: 'linear-gradient(145deg, rgba(0, 229, 255, 0.1), rgba(10, 14, 26, 0.9))', border: '1px solid rgba(0, 229, 255, 0.2)', padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff', fontSize: '0.9rem', fontWeight: 600 }}>
                      <FileText size={18} /> Total Investido
                    </div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
                      {formatPrice(totalSpent)}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(10, 14, 26, 0.8)', border: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a1a1aa', fontSize: '0.9rem', fontWeight: 600 }}>
                      <User size={18} /> Chave Cliente (UID)
                    </div>
                    <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', fontWeight: 800, color: '#e2e8f0', marginTop: 'auto' }}>
                      {user.id.split('-')[0].toUpperCase()}
                    </div>
                  </div>
                </div>

                {/* Pedidos List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                  {displayOrders.map((order: any) => (
                    <div key={order.id} className="order-card card-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                      
                      {/* Linha Superior: Info Principal */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            Pedido
                          </div>
                          <div style={{ fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>#{order.id.split('-')[0].toUpperCase()}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <Clock size={14} /> Data da Compra
                          </div>
                          <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            Total Pago
                          </div>
                          <div style={{ color: '#00e5ff', fontWeight: 800, fontSize: '1.1rem' }}>{formatPrice(order.total)}</div>
                        </div>
                        
                        <div>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}>Status</div>
                          <OrderStatusBadge orderId={order.id} initialStatus={order.status} />
                        </div>
                      </div>
                      
                      <hr style={{ border: 0, height: '1px', background: 'rgba(255,255,255,0.08)', margin: 0 }} />

                      {/* Linha Inferior: Rastreio e Ações */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                        
                        {order.tracking_code ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px 16px', borderRadius: '0.75rem', border: '1px dashed rgba(255,255,255,0.15)' }}>
                            <Package size={20} color="#10b981" />
                            <div>
                              <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>Código de Rastreio</div>
                              <div style={{ fontWeight: 700, letterSpacing: '1px', color: '#fff' }}>{order.tracking_code}</div>
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 0' }}>
                            <Clock size={16} /> Preparando envio...
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', gap: '1rem', marginLeft: 'auto' }}>
                          <button className="action-btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', padding: '10px 16px', borderRadius: '0.5rem', color: '#e2e8f0', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                            <FileText size={16} /> Nota Fiscal
                          </button>
                          <button className="action-btn" style={{ background: 'rgba(0, 229, 255, 0.1)', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '10px 16px', borderRadius: '0.5rem', color: '#00e5ff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                            <Headset size={16} /> Falar com Suporte
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}


            {currentTab === 'dados' && (
              <ProfileForm profile={profile} userEmail={user.email || ''} />
            )}

            {currentTab === 'enderecos' && (
              <AddressManager initialAddresses={profile?.addresses || []} />
            )}

            {currentTab === 'seguranca' && (
              <SecurityForm />
            )}
          </main>

        </div>
      </Container>
    </div>
  )
}
