'use client'

import React, { useState, useEffect } from 'react'
import { AdminSidebar } from './AdminSidebar'
import { Menu, X } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { StoreProvider } from './StoreContext'

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  // Fechar sidebar ao mudar de rota no mobile
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const isLoginPage = pathname === '/admin/login'
  const isUnauthorizedPage = pathname === '/admin/unauthorized'
  const isAuthPage = isLoginPage || isUnauthorizedPage

  if (isAuthPage) {
    return (
      <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', flexDirection: 'column' }}>
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {children}
        </main>
      </div>
    )
  }

  return (
    <div className="admin-layout" style={{ display: 'flex', minHeight: '100vh', background: '#1e1e1e', flexDirection: 'column' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .admin-main-grid { display: flex; flex: 1; overflow: hidden; }
        .admin-sidebar-container {
          width: 260px;
          flex-shrink: 0;
          transition: transform 0.3s ease;
        }
        .admin-mobile-header {
          display: none;
          background: #2c2e36;
          padding: 16px;
          border-bottom: 1px solid #1f2025;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .admin-overlay {
          display: none;
          position: fixed;
          top: 0; left: 0; width: 100vw; height: 100vh;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 9998;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .admin-main-content {
          flex: 1;
          padding: 24px 32px;
          background: #1e1e1e;
          overflow-y: auto;
          overflow-x: hidden;
          max-width: 100vw;
        }
        
        @media (max-width: 1024px) {
          .admin-sidebar-container {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 9999;
            transform: translateX(-100%);
          }
          .admin-sidebar-container.open {
            transform: translateX(0);
          }
          .admin-mobile-header {
            display: flex;
          }
          .admin-overlay.open {
            display: block;
            opacity: 1;
          }
          .admin-main-content {
            padding: 16px;
          }
        }

        /* Generic Mobile Utility Classes */
        .admin-grid-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        .admin-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 20px; }
        .admin-header-flex { display: flex; align-items: center; justify-content: space-between; }
        .admin-overflow-table { overflow-x: auto; -webkit-overflow-scrolling: touch; width: 100%; border-radius: 12px; }
        
        @media (max-width: 768px) {
          .admin-grid-2-1 { grid-template-columns: 1fr; gap: 16px; }
          .admin-kpi-grid { grid-template-columns: 1fr; }
          .admin-header-flex { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}} />

      {/* Header Mobile */}
      <div className="admin-mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src="https://cdn.awsli.com.br/400x300/1940/1940182/logo/logo_novo_kings_-removebg-preview-1-ireduuhg5i.png"
            alt="Kings Simuladores"
            style={{ width: 'auto', height: '28px', objectFit: 'contain' }}
          />
          <div>
            <h2 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              Kings<span style={{ color: '#64748b', fontWeight: 400 }}>Hub</span>
            </h2>
          </div>
        </div>
        <button onClick={() => setIsMobileOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff' }}>
          <Menu size={24} />
        </button>
      </div>

      <div className="admin-main-grid">
        <StoreProvider>
        {/* Overlay do Mobile */}
        <div 
          className={`admin-overlay ${isMobileOpen ? 'open' : ''}`} 
          onClick={() => setIsMobileOpen(false)} 
        />

        {/* Sidebar Dinâmica */}
        <div className={`admin-sidebar-container ${isMobileOpen ? 'open' : ''}`}>
          <AdminSidebar onCloseMobile={() => setIsMobileOpen(false)} />
        </div>

        {/* Conteúdo Principal */}
        <main className="admin-main-content">
          {children}
        </main>
        </StoreProvider>
      </div>
    </div>
  )
}
