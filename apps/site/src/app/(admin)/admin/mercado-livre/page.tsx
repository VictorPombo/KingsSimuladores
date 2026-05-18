'use client'

import React from 'react'
import { ShoppingBag, Info, ExternalLink } from 'lucide-react'

export default function MercadoLivrePage() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Mercado Livre</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Integração com o Mercado Livre para venda multicanal</p>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#FFE60020', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <ShoppingBag size={32} color="#FFE600" />
        </div>
        <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 12px 0' }}>Integração disponível em breve</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
          A integração com o Mercado Livre permitirá sincronizar automaticamente o catálogo de produtos, receber pedidos vindos do ML e gerenciar tudo por aqui.
        </p>
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <div style={{ padding: '12px 20px', background: '#3b82f618', border: '1px solid #3b82f630', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#3b82f6' }}>
            <Info size={14} /> Previsão: próxima atualização
          </div>
          <a href="https://developers.mercadolivre.com.br" target="_blank" style={{ padding: '12px 20px', background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#cbd5e1', textDecoration: 'none' }}>
            <ExternalLink size={14} /> API Docs
          </a>
        </div>
      </div>
    </div>
  )
}
