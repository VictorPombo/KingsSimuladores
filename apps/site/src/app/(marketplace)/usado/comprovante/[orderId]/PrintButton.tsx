'use client'

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem',
        fontWeight: 600, color: '#FF6B35', border: '1px solid rgba(255,107,53,0.3)',
        background: 'rgba(255,107,53,0.1)', cursor: 'pointer',
      }}
    >
      🖨️ Imprimir / Salvar PDF
    </button>
  )
}
