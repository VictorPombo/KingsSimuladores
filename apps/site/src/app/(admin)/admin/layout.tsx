import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside style={{ width: '250px', background: 'var(--bg-sidebar, #0c1018)', color: 'var(--text-sidebar, #8892a8)', padding: '2rem 1rem', borderRight: '1px solid var(--border, #1a2035)' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', padding: '0 1rem', color: '#fff' }}>KingsHub Admin</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
          <Link href="/admin/moderacao" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'inherit' }}>Moderação MSU</Link>
          <Link href="/admin/pedidos" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'inherit' }}>Pedidos Kings</Link>
        </nav>
        <div style={{ paddingTop: '2rem', borderTop: '1px solid var(--border, #1a2035)', marginTop: '2rem' }}>
          <Link href="/" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'var(--accent, #00e5ff)', fontSize: '0.85rem' }}>← Voltar ao Site</Link>
        </div>
      </aside>
      <main style={{ flex: 1, padding: '2rem', background: 'transparent' }}>
        {children}
      </main>
    </div>
  )
}
