import { RelatoriosClient } from './RelatoriosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RelatoriosAdminPage() {
  // O middleware já valida autenticação e role admin — não precisa duplicar aqui
  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <RelatoriosClient />
    </div>
  )
}
