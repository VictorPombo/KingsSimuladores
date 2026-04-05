import React from 'react'
import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

export default async function ModeracaoPage() {
  const supabase = createAdminClient()
  
  const { data: pendentesData, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
  
  const pendentes = pendentesData as any[]

  // Server Action para aprovar
  async function approveListing(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const s = createAdminClient()
    await (s.from('marketplace_listings') as any).update({ status: 'active' }).eq('id', id)
    revalidatePath('/moderacao')
  }

  // Server Action para rejeitar
  async function rejectListing(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const reason = formData.get('reason') as string
    const s = createAdminClient()
    await (s.from('marketplace_listings') as any).update({ 
      status: 'rejected', 
      rejection_reason: reason 
    }).eq('id', id)
    revalidatePath('/moderacao')
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Fila de Moderação (MSU)</h1>
      <p style={{ color: '#64748b', marginBottom: '2rem' }}>Aprove ou rejeite classificados submetidos por pilotos.</p>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {pendentes?.length === 0 && (
        <div style={{ padding: '3rem', background: '#fff', borderRadius: '0.5rem', border: '1px solid var(--border)', textAlign: 'center', color: '#64748b' }}>
          🎉 Tudo limpo! Não há anúncios pendentes.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {pendentes?.map((item) => (
          <div key={item.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid var(--border)', display: 'flex', gap: '1.5rem' }}>
            <img src={item.images[0]} alt="thumb" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '0.25rem' }} />
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{item.title}</h3>
              <div style={{ display: 'flex', gap: '1rem', color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span>💰 R$ {item.price}</span>
                <span>📦 {item.condition}</span>
                <span>👤 Vendedor ID: {item.seller_id}</span>
              </div>
              <p style={{ color: '#334155', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>{item.description}</p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <form action={approveListing}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" style={{ background: '#10b981', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    ✅ Aprovar Classificado
                  </button>
                </form>

                <form action={rejectListing} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="text" name="reason" placeholder="Motivo da recusa..." required style={{ border: '1px solid #cbd5e1', padding: '0.4rem 0.75rem', borderRadius: '0.25rem' }} />
                  <button type="submit" style={{ background: '#ef4444', color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.25rem', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
                    ❌ Rejeitar
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
