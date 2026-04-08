'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  PieChart, 
  ShoppingCart, 
  Package, 
  Megaphone,
  Share2,
  DollarSign,
  Settings,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  ChevronLeft,
  Store
} from 'lucide-react'

// Estrutura separada por ecossistema
const MENU_SECTIONS = [
  {
    title: 'LOJA KINGS',
    color: '#25d366',
    items: [
      { label: 'Início', icon: Home, href: '/admin' },
      {
        label: 'Vendas',
        icon: ShoppingCart,
        subItems: [
          { label: 'Listar pedidos', href: '/admin/pedidos' },
          { label: 'Criar pedido', href: '/admin/criar-pedido' },
          { label: 'Link de carrinho', href: '/admin/link-carrinho' },
          { label: 'Clientes', href: '/admin/clientes' },
          { label: 'Relatórios', href: '/admin/relatorios' },
          { label: 'Notas fiscais BETA', href: '/admin/notas-fiscais' }
        ]
      },
      {
        label: 'Produtos',
        icon: Package,
        subItems: [
          { label: 'Listar produtos', href: '/admin/produtos' },
          { label: 'Criar produto', href: '/admin/criar-produto' },
          { label: 'Avaliações', href: '/admin/avaliacoes' },
          { label: 'Importar', href: '/admin/importar-produtos' },
          { label: 'Preços segmentados', href: '/admin/precos-segmentados' },
          { label: 'Categorias', href: '/admin/categorias' },
          { label: 'Marcas', href: '/admin/marcas' },
          { label: 'Grades', href: '/admin/grades' },
          { label: 'Lixeira de produtos', href: '/admin/lixeira-produtos' }
        ]
      },
      {
        label: 'Marketing',
        icon: Megaphone,
        subItems: [
          { label: 'Promoções', href: '/admin/promocoes' },
          { label: 'Brinde', href: '/admin/brindes' },
          { label: 'Cupons de desconto', href: '/admin/cupons' },
          { label: 'Automações', href: '/admin/automacoes' },
          { label: 'Compre junto', href: '/admin/compre-junto' },
          { label: 'Frete grátis', href: '/admin/frete-gratis' },
          { label: 'Newsletter', href: '/admin/newsletter' },
          { label: 'Avise-me', href: '/admin/avise-me' }
        ]
      }
    ]
  },
  {
    title: 'MARKETPLACE MSU',
    color: '#06b6d4',
    items: [
      {
        label: 'Marketplace MSU',
        icon: Store,
        subItems: [
          { label: 'Dashboard MSU', href: '/admin?tab=msu' },
          { label: 'Anúncios', href: '/admin/msu-anuncios' },
          { label: 'Moderação', href: '/admin/moderacao' },
          { label: 'Vendedores', href: '/admin/msu-vendedores' },
          { label: 'Comissões', href: '/admin/msu-comissoes' }
        ]
      }
    ]
  },
  {
    title: 'SISTEMA',
    color: '#94a3b8',
    items: [
      {
        label: 'Visão de Negócio',
        icon: PieChart,
        subItems: [
          { label: 'Diário de Bordo', href: '/admin/diario-de-bordo' },
          { label: 'Relatórios', href: '/admin/relatorios' }
        ]
      },
      {
        label: 'Canais de vendas',
        icon: Share2,
        subItems: [
          { label: 'Google Shopping', href: '/admin/google-shopping' },
          { label: 'Mercado Livre', href: '/admin/mercado-livre' }
        ]
      },
      {
        label: 'Financeiro',
        icon: DollarSign,
        subItems: [
          { label: 'Comissões (Split)', href: '/admin/comissoes' },
          { label: 'Faturas', href: '/admin/faturas' }
        ]
      },
      {
        label: 'Configurações',
        icon: Settings,
        subItems: [
          { label: 'Gerais', href: '/admin/config-gerais' },
          { label: 'Dados da loja', href: '/admin/dados-loja' },
          { label: 'Usuários', href: '/admin/usuarios' },
          { label: 'Formas de pagamento', href: '/admin/formas-pagamento' },
          { label: 'Formas de envio', href: '/admin/formas-envio' },
          { label: 'Domínio próprio', href: '/admin/dominio' },
          { label: 'Chave para API', href: '/admin/chave-api' },
          { label: 'Gerenciador de arquivos', href: '/admin/gerenciador-arquivos' },
          { label: 'Aplicativos', href: '/admin/aplicativos' }
        ]
      }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})

  // Expandir automaticamente os menus que contém a rota atual
  useEffect(() => {
    MENU_SECTIONS.forEach(section => {
      section.items.forEach(item => {
        if (item.subItems) {
          const isActive = item.subItems.some(sub => {
            const pathWithoutQuery = sub.href.split('?')[0]
            return pathWithoutQuery === pathname && sub.href !== 'javascript:;'
          })
          if (isActive) {
            setOpenMenus(prev => ({ ...prev, [item.label]: true }))
          }
        }
      })
    })
  }, [pathname])

  const toggleMenu = (label: string) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }))
  }

  const isMenuPathActive = (href: string) => {
    return pathname === href && href !== 'javascript:;'
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '24px', background: '#25d366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {/* Pseudo Logo */}
            <span style={{ fontSize: '12px', fontWeight: 900, color: '#fff' }}>K</span>
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px' }}>
            Kings<span style={{ color: '#aaa', fontWeight: 400 }}>Hub</span>
          </h2>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4', letterSpacing: '1px', marginLeft: '32px' }}>EXPANSÃO</span>
      </div>

      {/* Menu Principal com scroller nativo */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }} className="hide-scroll">
        <style dangerouslySetInnerHTML={{__html: `
          .hide-scroll::-webkit-scrollbar { display: none; }
          .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
          .sidebar-item-hover:hover { background: rgba(255,255,255,0.05); }
          .sidebar-sub-hover:hover { background: rgba(255,255,255,0.08); color: #fff; }
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
                {section.title}
              </div>
              
              {section.items.map((item, idx) => {
                const hasSub = !!item.subItems
                const isOpen = openMenus[item.label]
                const Icon = item.icon
                
                const isRootActive = isMenuPathActive(item.href || '')

                return (
                  <div key={idx} style={{ padding: '0 12px', marginBottom: '4px' }}>
                    {hasSub ? (
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className="sidebar-item-hover"
                        style={{
                          width: '100%',
                          background: 'transparent',
                          border: 'none',
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
                      <a href={item.href!} style={{ textDecoration: 'none' }}>
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
                        background: isRootActive ? 'rgba(34, 211, 238, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        borderLeft: isRootActive ? '3px solid #22d3ee' : '3px solid transparent'
                      }}
                    >
                      <Icon size={18} strokeWidth={isRootActive ? 2.5 : 2} style={{ color: isRootActive ? '#22d3ee' : '#94a3b8' }} />
                      <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
                    </div>
                  </a>
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
                    {item.subItems.map((sub, sIdx) => {
                      const isActive = isMenuPathActive(sub.href)
                      const isMock = sub.href === 'javascript:;'

                      return (
                        <div key={sIdx}>
                          {isMock ? (
                            <a 
                              href={sub.href}
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
                            </a>
                          ) : (
                            <a href={sub.href} style={{ textDecoration: 'none' }}>
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
                                  <span style={{ float: 'right', width: '4px', height: '4px', background: '#25d366', borderRadius: '50%', marginTop: '6px' }} />
                                )}
                              </div>
                            </a>
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
