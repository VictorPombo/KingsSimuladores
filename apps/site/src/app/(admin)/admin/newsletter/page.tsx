'use client'

import React, { useState } from 'react'
import { Mail, Users, Send, TrendingUp, Download, Plus } from 'lucide-react'

export default function NewsletterPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Newsletter</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Gerencie inscritos e dispare e-mails em massa</p>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', border: 'none', borderRadius: '8px', padding: '10px 20px', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 2px 8px rgba(59,130,246,0.3)' }}><Send size={16} /> Enviar Campanha</button>
      </div>

      {/* Explainer */}
      <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#3b82f620', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Mail size={28} color="#3b82f6" /></div>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
            A Newsletter captura e-mails dos visitantes da loja e permite enviar <strong style={{ color: '#cbd5e1' }}>campanhas em massa</strong> com novidades, lançamentos e promoções. <br/>
            <span style={{ color: '#64748b' }}>Exemplo: Chegou um cockpit novo → você dispara um e-mail para todos os inscritos: "Novidade na pista! Cockpit GTR Pro já disponível com 15% OFF no lançamento".</span>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Inscritos', value: '0', color: '#3b82f6', icon: Users },
          { label: 'Campanhas Enviadas', value: '0', color: '#10b981', icon: Send },
          { label: 'Taxa de Abertura', value: '—', color: '#f59e0b', icon: TrendingUp },
        ].map((k, i) => (
          <div key={i} style={{ background: '#2c2e36', borderRadius: '8px', padding: '20px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <k.icon size={20} color={k.color} />
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' }}>{k.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: k.color, marginTop: '2px' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #3f424d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#e2e8f0', fontSize: '0.95rem', fontWeight: 600 }}>Lista de inscritos</span>
          <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #3f424d', borderRadius: '6px', padding: '6px 12px', color: '#cbd5e1', fontSize: '0.8rem', cursor: 'pointer' }}><Download size={14} /> Exportar</button>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>
            {['E-mail', 'Inscrito em', 'Status'].map(h => (
              <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', background: '#1f2025' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            <tr><td colSpan={3} style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
              <Mail size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.3 }} />
              <p style={{ margin: '0 0 4px', fontSize: '0.9rem', fontWeight: 500 }}>Nenhum inscrito ainda</p>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Inscritos da newsletter aparecerão aqui.</p>
            </td></tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
