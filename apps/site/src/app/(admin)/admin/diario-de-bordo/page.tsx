import { DiarioDeBordoClient } from './DiarioDeBordoClient'

export default function DiarioDeBordoPage() {
  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #2a2d3d' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '1px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Kings Simuladores
          </h1>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>
            Atualizado em {new Date().toLocaleDateString('pt-BR')} (Demonstração com Dados Estruturais)
          </div>
        </div>
      </header>

      <DiarioDeBordoClient />
    </div>
  )
}
