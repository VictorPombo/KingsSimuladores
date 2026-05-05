'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { useStoreContext, StoreType } from './StoreContext'
import { 
  PieChart, 
  ShoppingCart, 
  Package, 
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Store,
  Tag,
  Users,
  FileText,
  Bell,
  ChevronsUpDown
} from 'lucide-react'

// Estrutura separada por ecossistema de forma limpa
const MENU_SECTIONS = [
  {
    title: 'LOJA KINGS B2C',
    color: '#25d366',
    logoUrl: '/logo_kings.png',
    items: [
      { label: 'Visão Geral', icon: PieChart, href: '/admin?tab=kings' },
      {
        label: 'Pedidos',
        icon: ShoppingCart,
        subItems: [
          { label: 'Todos os Pedidos', href: '/admin/pedidos' },
          { label: 'Notas Fiscais', href: '/admin/notas-fiscais' },
          { label: 'Criar Pedido', href: '/admin/criar-pedido' },
          { label: 'Clientes', href: '/admin/clientes' }
        ]
      },
      {
        label: 'Catálogo',
        icon: Package,
        subItems: [
          { label: 'Produtos', href: '/admin/produtos' },
          { label: 'Categorias', href: '/admin/categorias' },
          { label: 'Marcas', href: '/admin/marcas' },
          { label: 'Grades', href: '/admin/grades' }
        ]
      }
    ]
  },
  {
    title: 'MARKETPLACE MSU',
    color: '#06b6d4',
    logoUrl: '/logo_msu.png',
    items: [
      { label: 'Chat & Negociações', icon: PieChart, href: '/admin/msu-chat' },
      { label: 'Pagamentos & Cofre', icon: PieChart, href: '/admin/msu-pagamentos' },
      {
        label: 'Anúncios',
        icon: Tag,
        subItems: [
          { label: 'Fila de Moderação', href: '/admin/moderacao' },
          { label: 'Anúncios Ativos', href: '/admin/msu-anuncios' }
        ]
      },
      {
        label: 'Autores & Financeiro',
        icon: Users,
        subItems: [
          { label: 'Vendedores', href: '/admin/msu-vendedores' },
          { label: 'Extrato de Comissões', href: '/admin/msu-comissoes' }
        ]
      }
    ]
  },
  {
    title: 'SEVEN SIM RACING',
    color: '#ea580c',
    logoUrl: '/logo-seven.svg',
    items: [
      { label: 'Visão Geral', icon: PieChart, href: '/admin?tab=seven' },
      {
        label: 'Pedidos',
        icon: ShoppingCart,
        subItems: [
          { label: 'Todos os Pedidos', href: '/admin/pedidos' },
          { label: 'Notas Fiscais', href: '/admin/notas-fiscais' },
          { label: 'Clientes', href: '/admin/clientes' }
        ]
      },
      {
        label: 'Catálogo',
        icon: Package,
        subItems: [
          { label: 'Produtos', href: '/admin/produtos' },
          { label: 'Categorias', href: '/admin/categorias' },
          { label: 'Marcas', href: '/admin/marcas' }
        ]
      }
    ]
  },
  {
    title: 'SISTEMA E INTEGRAÇÕES',
    color: '#94a3b8',
    items: [
      {
        label: 'Integrações Externas',
        icon: Store,
        subItems: [
          { label: 'Aplicativos & APIs (Bling/Olist)', href: '/admin/aplicativos' },
          { label: 'Mercado Livre', href: '/admin/mercado-livre' },
          { label: 'Google Shopping', href: '/admin/google-shopping' }
        ]
      },
      {
        label: 'Comunicação',
        icon: Bell,
        subItems: [
          { label: 'Notificações Globais', href: '/admin/notificacoes' },
          { label: 'Newsletter', href: '/admin/newsletter' }
        ]
      },
      {
        label: 'Configurações Globais',
        icon: Settings,
        subItems: [
          { label: 'Dados Básicos', href: '/admin/dados-loja' },
          { label: 'Equipe de Usuários', href: '/admin/usuarios' },
          { label: 'Processadores de Pagamento', href: '/admin/formas-pagamento' },
          { label: 'Logística de Envios', href: '/admin/formas-envio' },
          { label: 'Domínio Web', href: '/admin/dominio' }
        ]
      },
      {
        label: 'Manutenção do Sistema',
        icon: FileText,
        subItems: [
          { label: 'Diário de Bordo (Logs)', href: '/admin/diario-de-bordo' }
        ]
      }
    ]
  }
]

export function AdminSidebar({ onCloseMobile }: { onCloseMobile?: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const { currentStore, setCurrentStore } = useStoreContext()

  // Sincronizar dropdown com a tab da URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'kings' || tab === 'msu' || tab === 'seven' || tab === 'all') {
      setCurrentStore(tab)
    }
  }, [searchParams, setCurrentStore])

  // Expandir automaticamente os menus que contém a rota atual
  useEffect(() => {
    MENU_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          const isActive = item.subItems.some(sub => {
            const pathWithoutQuery = sub.href.split('?')[0]
            const isMatch = pathWithoutQuery === pathname && sub.href !== 'javascript:;'
            
            if (!isMatch) return false;
            
            if (currentStore !== 'all') {
              if (section.title === 'LOJA KINGS B2C' && currentStore !== 'kings') return false;
              if (section.title === 'MARKETPLACE MSU' && currentStore !== 'msu') return false;
              if (section.title === 'SEVEN SIM RACING' && currentStore !== 'seven') return false;
            }
            return true;
          })
          if (isActive) {
            setOpenMenus(prev => ({ ...prev, [`${section.title}-${item.label}`]: true }))
          }
        }
      })
    })
  }, [pathname, currentStore])

  const toggleMenu = (key: string) => {
    setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleLinkClick = (title: string) => {
    if (title === 'LOJA KINGS B2C') setCurrentStore('kings')
    else if (title === 'MARKETPLACE MSU') setCurrentStore('msu')
    else if (title === 'SEVEN SIM RACING') setCurrentStore('seven')
  }

  const isMenuPathActive = (href: string, sectionTitle: string) => {
    const [hrefPath, hrefQuery] = href.split('?')
    let isPathMatch = false;

    if (hrefQuery) {
      const hrefTab = new URLSearchParams(hrefQuery).get('tab')
      isPathMatch = pathname === hrefPath && searchParams.get('tab') === hrefTab
    } else {
      isPathMatch = pathname === href && href !== 'javascript:;'
    }

    if (!isPathMatch) return false;

    if (currentStore !== 'all') {
      if (sectionTitle === 'LOJA KINGS B2C' && currentStore !== 'kings') return false;
      if (sectionTitle === 'MARKETPLACE MSU' && currentStore !== 'msu') return false;
      if (sectionTitle === 'SEVEN SIM RACING' && currentStore !== 'seven') return false;
    }

    return true;
  }

  return (
    <aside style={{ 
      width: '260px', 
      background: '#2c2e36', // Cor exata de fundo da LI Expansão
      color: '#e5e7eb', 
      display: 'flex', 
      flexDirection: 'column', 
      position: 'relative',
      overflowX: 'hidden'
    }}>
      
      {/* Header Topo Sidebar */}
      <div style={{ 
        padding: '24px', 
        borderBottom: '1px solid #1f2025',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                Kings<span style={{ color: '#64748b', fontWeight: 400 }}>Hub</span>
              </h2>
              <span style={{ fontSize: '0.6rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '2px' }}>EXPANSÃO</span>
            </div>
          </div>
          {onCloseMobile && (
            <button onClick={onCloseMobile} className="mobile-close-btn" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'none' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>&times;</span>
            </button>
          )}
        </div>
        
        {/* Seletor de Loja (Multi-Tenant) */}
        <div style={{ marginTop: '16px', position: 'relative' }}>
          <select 
            value={currentStore}
            onChange={(e) => setCurrentStore(e.target.value as StoreType)}
            style={{
              width: '100%',
              padding: '10px 36px 10px 14px',
              background: 'linear-gradient(180deg, #24262d 0%, #1f2025 100%)',
              border: '1px solid #3f424d',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '0.85rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              appearance: 'none',
              WebkitAppearance: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <option value="all">Todas as Lojas (Visão Global)</option>
            <option value="kings">Kings Simuladores</option>
            <option value="msu">Meu Simulador Usado (MSU)</option>
            <option value="seven">Seven Sim Racing</option>
          </select>
          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
            <ChevronsUpDown size={14} />
          </div>
        </div>
      </div>

      {/* Menu Principal com scroller nativo */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }} className="hide-scroll">
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          .sidebar-item-hover:hover { background: rgba(255,255,255,0.05); }
          .sidebar-item-hover:focus, button:focus { outline: none !important; }
          .sidebar-sub-hover:hover { background: rgba(255,255,255,0.08); color: #fff; }
          @media (max-width: 1024px) {
            .mobile-close-btn { display: block !important; margin-right: 8px; }
            aside { width: 280px !important; }
          }
        `}} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {MENU_SECTIONS.map((section, sIdx) => (
            <div key={sIdx} style={{ marginBottom: '16px' }}>
              <div style={{ 
                padding: '8px 24px', 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                color: section.color || '#64748b', 
                letterSpacing: '1px',
                textTransform: 'uppercase',
                borderTop: sIdx > 0 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                paddingTop: sIdx > 0 ? '16px' : '8px',
                marginTop: sIdx > 0 ? '8px' : '0'
              }}>
                {section.logoUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', gap: '8px', paddingBottom: '8px', paddingTop: '4px' }}>
                    <img 
                      src={section.logoUrl} 
                      alt={section.title} 
                      style={{ 
                        height: '36px', 
                        objectFit: 'contain', 
                        objectPosition: 'left',
                        maxWidth: '100%'
                      }} 
                    />
                    <span style={{ color: section.color, opacity: 0.9, textAlign: 'left', width: '100%', paddingLeft: '2px' }}>{section.title}</span>
                  </div>
                ) : (
                  section.title
                )}
              </div>
              
              {section.items.map((item: any, idx: number) => {
                const hasSub = !!item.subItems
                const menuKey = `${section.title}-${item.label}`
                const isOpen = openMenus[menuKey]
                const Icon = item.icon
                
                const isRootActive = isMenuPathActive(item.href || '', section.title)

                return (
                  <div key={idx} style={{ padding: '0 12px', marginBottom: '4px' }}>
                    {hasSub ? (
                      <button
                        onClick={() => toggleMenu(menuKey)}
                        className="sidebar-item-hover"
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          color: isOpen ? '#fff' : '#cbd5e1',
                          padding: '12px',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          fontWeight: isOpen ? 600 : 500,
                          transition: 'all 0.2s'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Icon size={18} strokeWidth={isOpen ? 2.5 : 2} style={{ color: isOpen ? section.color : '#94a3b8' }} />
                          <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                        </div>
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>
                    ) : (
                      <Link href={item.href!} onClick={() => handleLinkClick(section.title)} style={{ textDecoration: 'none' }}>
                        <div 
                          className="sidebar-item-hover"
                          style={{
                            color: isRootActive ? section.color : '#cbd5e1',
                            padding: '12px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            fontWeight: isRootActive ? 600 : 500,
                            background: isRootActive ? `${section.color}15` : 'transparent',
                            transition: 'all 0.2s',
                            borderLeft: isRootActive ? `3px solid ${section.color}` : '3px solid transparent'
                          }}
                        >
                          <Icon size={18} strokeWidth={isRootActive ? 2.5 : 2} style={{ color: isRootActive ? section.color : '#94a3b8' }} />
                      <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                    </div>
                  </Link>
                )}

                {/* SubMenus Rendering */}
                {hasSub && isOpen && (
                  <div style={{ 
                    marginTop: '4px',
                    marginLeft: '8px', 
                    paddingLeft: '16px', 
                    borderLeft: '1px solid #4a4d57', /* Fio guia da Loja Integrada */
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '2px' 
                  }}>
                    {item.subItems.map((sub: any, sIdx: number) => {
                      const isActive = isMenuPathActive(sub.href, section.title)
                      const isMock = sub.href === 'javascript:;'

                      return (
                        <div key={sIdx}>
                          {isMock ? (
                            <span 
                              className="sidebar-sub-hover"
                              style={{
                                display: 'block',
                                padding: '10px 16px',
                                borderRadius: '6px',
                                textDecoration: 'none',
                                color: '#94a3b8',
                                fontSize: '0.85rem',
                                transition: 'all 0.2s',
                                cursor: 'not-allowed'
                              }}
                            >
                              {sub.label} <span style={{ opacity: 0.3, fontSize: '0.7rem' }}></span>
                            </span>
                          ) : (
                            <Link href={sub.href} onClick={() => handleLinkClick(section.title)} style={{ textDecoration: 'none' }}>
                              <div
                                className="sidebar-sub-hover"
                                style={{
                                  display: 'block',
                                  padding: '10px 16px',
                                  borderRadius: '6px',
                                  color: isActive ? '#fff' : '#94a3b8',
                                  background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                  fontWeight: isActive ? 600 : 400,
                                  fontSize: '0.85rem',
                                  transition: 'all 0.2s'
                                }}
                              >
                                {sub.label}
                                {isActive && (
                                  <span style={{ float: 'right', width: '4px', height: '4px', background: section.color, borderRadius: '50%', marginTop: '6px' }} />
                                )}
                              </div>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer / Ver Loja */}
      <div style={{ padding: '16px' }}>
        <Link href="/" target="_blank" style={{ textDecoration: 'none' }}>
          <div 
            className="sidebar-item-hover"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '14px', 
              background: '#202127', 
              borderRadius: '8px', 
              color: '#fff', 
              border: '1px solid #4a4d57',
              transition: 'all 0.2s'
            }}>
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Ver a loja</span>
            <ExternalLink size={16} color="#94a3b8" />
          </div>
        </Link>
      </div>

    </aside>
  )
}
