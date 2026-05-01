import React from 'react'
import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Container, Button } from '@kings/ui'
import { formatPrice } from '@kings/utils'
import { OrderStatusBadge } from '@/components/store/account/OrderStatusBadge'
import { OrderExpandableCard } from '@/components/store/account/OrderExpandableCard'
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
import { ProfileForm, AddressManager, SecurityForm, LogoutButton } from './ClientForms'

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

  const displayOrders = orders || []

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
               <LogoutButton />
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
                  {displayOrders.length === 0 ? (
                    <div className="card-panel" style={{ textAlign: 'center', padding: '4rem 2rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                      <Package size={48} color="#64748b" style={{ margin: '0 auto 1rem' }} />
                      <h3 style={{ fontSize: '1.2rem', color: '#e2e8f0', margin: '0 0 0.5rem 0' }}>Nenhum pedido encontrado</h3>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Aguardando o seu primeiro pedido! Quando você realizar uma compra, ela aparecerá aqui.</p>
                      <Link href="/" className="action-btn kings-btn-primary" style={{ background: '#00e5ff', color: '#0a0e1a', padding: '10px 24px', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 700, display: 'inline-block' }}>
                        Explorar Produtos
                      </Link>
                    </div>
                  ) : (
                    displayOrders.map((order: any) => (
                      <OrderExpandableCard key={order.id} order={order} />
                    ))
                  )}
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
