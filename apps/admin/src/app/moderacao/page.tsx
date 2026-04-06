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
    <div style={{ padding: '20px', paddingBottom: '40px' }}>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff', lineHeight: 1.1 }}>Fila de Moderação</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Aprove classificados deslizando.</p>

      {error && <div style={{ color: 'red' }}>Error: {error.message}</div>}

      {pendentes?.length === 0 && (
        <div style={{ padding: '3rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          Tudo limpo! Não há anúncios.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {pendentes?.map((item) => (
          <div key={item.id} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
            {/* Imagem full width mobile */}
            <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#fff', position: 'relative' }}>
              <img src={item.images[0]} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '20px', color: '#fff', fontWeight: 800, fontSize: '0.9rem' }}>
                R$ {item.price}
              </div>
            </div>

            <div style={{ padding: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#fff' }}>{item.title}</h3>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📦 {item.condition}</span>
                <span style={{ background: 'var(--bg-secondary)', padding: '4px 8px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>👤 {item.seller_id}</span>
              </div>
              
              <p style={{ color: 'var(--text-primary)', fontSize: '0.9rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>
                {item.description}
              </p>
              
              {/* Botões Bottom Mobile Style */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <form action={approveListing}>
                  <input type="hidden" name="id" value={item.id} />
                  <button type="submit" style={{ width: '100%', background: '#10b981', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}>
                    ✅ APROVAR
                  </button>
                </form>

                <form action={rejectListing} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.05)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="text" name="reason" placeholder="Motivo da recusa..." required style={{ border: '1px solid var(--border)', background: '#000', color: '#fff', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }} />
                  <button type="submit" style={{ width: '100%', background: '#ef4444', color: '#fff', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer' }}>
                    ❌ REJEITAR
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
