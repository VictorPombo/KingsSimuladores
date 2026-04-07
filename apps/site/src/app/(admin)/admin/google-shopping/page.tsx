'use client'

import React from 'react'
import { Globe, ExternalLink, CheckCircle, Clock, BarChart2 } from 'lucide-react'

export default function GoogleShoppingPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Google Shopping</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Feed de produtos para o Google Merchant Center</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Status do Feed', value: 'Ativo', color: '#10b981', icon: CheckCircle },
          { label: 'Produtos no Feed', value: '85', color: '#3b82f6', icon: BarChart2 },
          { label: 'Última Atualização', value: 'Tempo real', color: '#f59e0b', icon: Clock },
        ].map((k, i) => (
          <div key={i} style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <k.icon size={20} color={k.color} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: k.color, marginTop: '2px' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} color="#4285F4" /> Feed XML</h3>
          <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: '#10b98118', color: '#10b981', border: '1px solid #10b98130' }}>Online</span>
        </div>
        <div style={{ background: '#1f2025', borderRadius: '6px', padding: '14px 16px', fontFamily: 'monospace', fontSize: '0.82rem', color: '#22d3ee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>https://kingssimuladores.com.br/api/feed/google</span>
          <a href="/api/feed/google" target="_blank" style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', textDecoration: 'none' }}><ExternalLink size={14} /> Abrir</a>
        </div>
        <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '8px' }}>Cole esta URL no Google Merchant Center → Feeds → Adicionar feed principal.</p>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png" alt="Google" style={{ height: '18px' }} /> Merchant Center
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div style={{ background: '#1f2025', borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Formato</div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '4px' }}>XML — RSS 2.0 + g:namespace</div>
          </div>
          <div style={{ background: '#1f2025', borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Atualização</div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '4px' }}>SSR dinâmico — dados em tempo real</div>
          </div>
          <div style={{ background: '#1f2025', borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Campos inclusos</div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '4px' }}>title, description, price, availability, image, brand, GTIN</div>
          </div>
          <div style={{ background: '#1f2025', borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Moeda</div>
            <div style={{ fontSize: '0.9rem', color: '#e2e8f0', marginTop: '4px' }}>BRL (Real brasileiro)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
