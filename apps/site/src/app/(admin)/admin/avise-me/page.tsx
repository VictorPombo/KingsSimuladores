'use client'

import React from 'react'
import { Bell, Package, Mail, Plus } from 'lucide-react'

export default function AviseMePage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Avise-me</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Clientes que pediram para serem notificados quando um produto voltar ao estoque</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bell size={20} color="#f59e0b" />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Aguardando</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b', marginTop: '2px' }}>0</div>
          </div>
        </div>
        <div style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Mail size={20} color="#10b981" />
          <div>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>Notificados</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '2px' }}>0</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f59e0b20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Bell size={28} color="#f59e0b" /></div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            Quando um produto está fora de estoque, o botão "Avise-me" aparece na página do produto. O cliente informa seu e-mail e, ao repor o estoque, o sistema envia automaticamente uma notificação via Resend.
          </p>
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['Produto', 'E-mail do cliente', 'Cadastrado em', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            <tr><td colSpan={4} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <Package size={24} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              Nenhuma solicitação "Avise-me" registrada.
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
