'use client'

import React from 'react'
import { Store, MapPin, Phone, FileText, Building } from 'lucide-react'

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }
const sectionStyle: React.CSSProperties = { background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }

export default function DadosLojaPage() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Dados da Loja</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Informações fiscais e de contato</p>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Building size={18} color="#8b5cf6" /> Razão Social</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Razão Social</label><input type="text" defaultValue="SABRINA PRADO ALBERTONI LTDA" style={inputStyle} /></div>
          <div><label style={labelStyle}>Nome Fantasia</label><input type="text" defaultValue="Kings Simuladores" style={inputStyle} /></div>
          <div><label style={labelStyle}>CNPJ</label><input type="text" placeholder="XX.XXX.XXX/0001-XX" style={inputStyle} /></div>
          <div><label style={labelStyle}>Inscrição Estadual</label><input type="text" placeholder="Isento ou número" style={inputStyle} /></div>
          <div><label style={labelStyle}>Regime Tributário</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}><option>Simples Nacional</option><option>Lucro Presumido</option><option>Lucro Real</option></select>
          </div>
          <div><label style={labelStyle}>CNAE Principal</label><input type="text" placeholder="4789-0/99" style={inputStyle} /></div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={18} color="#10b981" /> Endereço</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>CEP</label><input type="text" placeholder="00000-000" style={inputStyle} /></div>
          <div><label style={labelStyle}>Endereço</label><input type="text" placeholder="Rua / Avenida" style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Número</label><input type="text" placeholder="000" style={inputStyle} /></div>
          <div><label style={labelStyle}>Complemento</label><input type="text" placeholder="Sala, Galpão..." style={inputStyle} /></div>
          <div><label style={labelStyle}>Bairro</label><input type="text" placeholder="Bairro" style={inputStyle} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div><label style={labelStyle}>Cidade</label><input type="text" placeholder="São Paulo" style={inputStyle} /></div>
          <div><label style={labelStyle}>Estado</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }}><option value="">UF</option>{['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}</select>
          </div>
        </div>
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={18} color="#3b82f6" /> Contato</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>E-mail comercial</label><input type="email" defaultValue="contato@kingssimuladores.com.br" style={inputStyle} /></div>
          <div><label style={labelStyle}>Telefone / WhatsApp</label><input type="text" placeholder="(11) 99999-9999" style={inputStyle} /></div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: '40px' }}>
        <button style={{ padding: '12px 28px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', boxShadow: '0 2px 12px rgba(139,92,246,0.3)' }}>Salvar alterações</button>
      </div>
    </div>
  )
}
