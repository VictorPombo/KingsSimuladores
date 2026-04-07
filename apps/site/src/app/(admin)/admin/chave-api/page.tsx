'use client'

import React, { useState } from 'react'
import { Key, Copy, Eye, EyeOff, CheckCircle, Shield } from 'lucide-react'

export default function ChaveAPIPage() {
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const apiKey = 'kng_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

  function copyKey() {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Chave para API</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Credenciais para integrações externas</p>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', marginBottom: '16px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Key size={18} color="#f59e0b" /> Chave de API da Loja</h3>
        <div style={{ background: '#1f2025', borderRadius: '6px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', border: '1px solid #3f424d' }}>
          <code style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem', color: showKey ? '#22d3ee' : '#64748b', letterSpacing: showKey ? '0' : '2px' }}>
            {showKey ? apiKey : '•'.repeat(40)}
          </code>
          <button onClick={() => setShowKey(!showKey)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', color: '#94a3b8' }}>
            {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button onClick={copyKey} style={{ background: 'transparent', border: '1px solid #3f424d', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', color: copied ? '#10b981' : '#94a3b8', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            {copied ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
        <div style={{ marginTop: '12px', padding: '10px 14px', background: '#ef444410', border: '1px solid #ef444425', borderRadius: '6px', fontSize: '0.78rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={14} /> Nunca compartilhe esta chave. Ela dá acesso total à sua loja.
        </div>
      </div>

      <div style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px' }}>
        <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 16px' }}>Variáveis de Ambiente</h3>
        <div style={{ display: 'grid', gap: '8px' }}>
          {[
            { key: 'NEXT_PUBLIC_SUPABASE_URL', status: 'set' },
            { key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', status: 'set' },
            { key: 'SUPABASE_SERVICE_ROLE_KEY', status: 'set' },
            { key: 'MP_ACCESS_TOKEN', status: 'pending' },
            { key: 'MELHOR_ENVIO_TOKEN', status: 'pending' },
            { key: 'CRON_SECRET', status: 'set' },
          ].map(env => (
            <div key={env.key} style={{ background: '#1f2025', borderRadius: '6px', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <code style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#e2e8f0' }}>{env.key}</code>
              <span style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold',
                background: env.status === 'set' ? '#10b98118' : '#f59e0b18',
                color: env.status === 'set' ? '#10b981' : '#f59e0b',
              }}>{env.status === 'set' ? '✓ Configurada' : '⚠ Pendente'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
