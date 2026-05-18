'use client'

const apps = [
  { name: 'Mercado Pago', desc: 'Pagamentos: Pix, Boleto, Cartão 12x, Split Payment', icon: '💰', status: 'active', color: '#00bcff' },
  { name: 'Frenet', desc: 'Cotação e geração de etiquetas (Sedex, Jadlog, Azul Cargo, LATAM, Buslog)', icon: '📦', status: 'active', color: '#00c853' },
  { name: 'Resend', desc: 'E-mails transacionais: confirmação, NF, newsletter', icon: '✉️', status: 'active', color: '#6366f1' },
  { name: 'Olist ERP', desc: 'Emissão automática de NF-e e Sincronização de Estoque B2C', icon: '🧾', status: 'active', color: '#ff5400' },
]

export default function AplicativosPage() {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Aplicativos & Integrações</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Serviços conectados à sua loja</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {apps.map(app => (
          <div key={app.name} style={{ background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ fontSize: '1.5rem' }}>{app.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{app.name}</div>
              </div>
              <span style={{
                padding: '3px 10px', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 'bold',
                background: app.status === 'active' ? '#10b98118' : '#f59e0b18',
                color: app.status === 'active' ? '#10b981' : '#f59e0b',
                border: `1px solid ${app.status === 'active' ? '#10b98130' : '#f59e0b30'}`
              }}>{app.status === 'active' ? 'Conectado' : 'Pendente'}</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: '0', lineHeight: 1.5, flex: 1 }}>{app.desc}</p>
            <div style={{ marginTop: '16px', borderTop: '1px solid #3f424d', paddingTop: '12px' }}>
              <div style={{ width: '100%', height: '4px', borderRadius: '2px', background: '#1f2025', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: app.status === 'active' ? '100%' : '30%', borderRadius: '2px', background: app.status === 'active' ? app.color : '#f59e0b', transition: 'width 1s' }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
