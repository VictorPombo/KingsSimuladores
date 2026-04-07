'use client'

import React from 'react'
import { Settings, Globe, Store, Shield, Clock } from 'lucide-react'

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }

export default function ConfigGeraisPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Configurações Gerais</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Dados básicos da loja</p>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Store size={18} color="#8b5cf6" /> Dados da Loja</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Nome da loja</label><input type="text" value="Kings Simuladores" readOnly style={inputStyle} /></div>
          <div><label style={labelStyle}>E-mail de contato</label><input type="email" value="contato@kingssimuladores.com.br" readOnly style={inputStyle} /></div>
          <div><label style={labelStyle}>CNPJ</label><input type="text" value="XX.XXX.XXX/0001-XX" readOnly style={inputStyle} /></div>
          <div><label style={labelStyle}>Telefone</label><input type="text" placeholder="(11) 99999-9999" style={inputStyle} /></div>
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Globe size={18} color="#3b82f6" /> Domínio & SEO</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Domínio principal</label><input type="text" value="kingssimuladores.com.br" readOnly style={inputStyle} /></div>
          <div><label style={labelStyle}>Título do site</label><input type="text" value="Kings Simuladores — Simuladores de Corrida" style={inputStyle} /></div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Meta descrição</label>
          <textarea style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} defaultValue="A maior loja de simuladores de corrida do Brasil. Cockpits, volantes, pedais e acessórios para sim racing." />
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={18} color="#10b981" /> Segurança</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: '#1f2025', borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>SSL</div>
            <div style={{ fontSize: '0.9rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>✓ Ativo (Vercel)</div>
          </div>
          <div style={{ background: '#1f2025', borderRadius: '6px', padding: '12px 16px' }}>
            <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>RLS (Row Level Security)</div>
            <div style={{ fontSize: '0.9rem', color: '#10b981', marginTop: '4px', fontWeight: 600 }}>✓ Ativo (Supabase)</div>
          </div>
        </div>
      </div>
    </div>
  )
}
