import { Grid3X3, Info } from 'lucide-react'

export default function GradesPage() {
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Grades de Variação</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Gerencie grades de tamanho, cor e variações dos produtos</p>
        </div>

        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '40px', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#22d3ee20', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Grid3X3 size={32} color="#22d3ee" />
          </div>
          <h2 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, margin: '0 0 12px 0' }}>Recurso em desenvolvimento</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            As grades de variação permitirão definir atributos como tamanho, cor, material e outras variações para cada produto,
            com controle de estoque individual por variação.
          </p>
          <div style={{ marginTop: '24px', padding: '12px 20px', background: '#22d3ee18', border: '1px solid #22d3ee30', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#22d3ee' }}>
            <Info size={14} /> Previsão de lançamento: próxima atualização
          </div>
        </div>
      </div>
    </div>
  )
}
