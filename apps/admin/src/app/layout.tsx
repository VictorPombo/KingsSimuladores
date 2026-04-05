import type { Metadata } from 'next'
import './globals.css'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'KingsHub Admin',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{ width: '250px', background: 'var(--bg-sidebar)', color: 'var(--text-sidebar)', padding: '2rem 1rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '2rem', padding: '0 1rem', color: '#fff' }}>KingsHub Admin</h2>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link href="/" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'inherit' }}>Dashboard</Link>
            <Link href="/moderacao" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.1)', textDecoration: 'none', color: '#fff', fontWeight: 600 }}>Moderação MSU</Link>
            <Link href="/pedidos" style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', textDecoration: 'none', color: 'inherit' }}>Pedidos Kings</Link>
          </nav>
        </aside>
        <main style={{ flex: 1, padding: '2rem' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
