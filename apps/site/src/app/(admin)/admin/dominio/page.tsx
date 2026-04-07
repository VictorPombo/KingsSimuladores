'use client'

import React from 'react'
import { Globe, CheckCircle, ExternalLink, Shield, Server } from 'lucide-react'

export default function DominioProprioPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Domínio Próprio</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Configuração de DNS e domínios da loja</p>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <Globe size={22} color="#10b981" />
          <div>
            <div style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>kingssimuladores.com.br</div>
            <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Domínio principal</div>
          </div>
          <span style={{ marginLeft: 'auto', padding: '4px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', background: '#10b98118', color: '#10b981', border: '1px solid #10b98130', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={12} /> Ativo</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { label: 'SSL', value: 'Let\'s Encrypt (Vercel)', icon: Shield, color: '#10b981' },
            { label: 'Hospedagem', value: 'Vercel Edge Network', icon: Server, color: '#3b82f6' },
            { label: 'DNS Provider', value: 'Configurar no registrador', icon: Globe, color: '#f59e0b' },
            { label: 'Deploy', value: 'Automático via git push', icon: ExternalLink, color: '#8b5cf6' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#1f2025', borderRadius: '6px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <item.icon size={16} color={item.color} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', marginTop: '2px' }}>{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Configuração DNS</h3>
        <div style={{ background: '#1f2025', borderRadius: '6px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead><tr>
              {['Tipo', 'Nome', 'Valor', 'TTL'].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #3f424d' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #3f424d' }}>
                <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: '#3b82f618', color: '#3b82f6', fontSize: '0.7rem', fontWeight: 'bold' }}>A</span></td>
                <td style={{ padding: '10px 14px', color: '#e2e8f0', fontFamily: 'monospace' }}>@</td>
                <td style={{ padding: '10px 14px', color: '#22d3ee', fontFamily: 'monospace' }}>76.76.21.21</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>3600</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 14px' }}><span style={{ padding: '2px 8px', borderRadius: '4px', background: '#10b98118', color: '#10b981', fontSize: '0.7rem', fontWeight: 'bold' }}>CNAME</span></td>
                <td style={{ padding: '10px 14px', color: '#e2e8f0', fontFamily: 'monospace' }}>www</td>
                <td style={{ padding: '10px 14px', color: '#22d3ee', fontFamily: 'monospace' }}>cname.vercel-dns.com</td>
                <td style={{ padding: '10px 14px', color: '#64748b' }}>3600</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
