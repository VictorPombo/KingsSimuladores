import React from 'react'
import { createServerSupabaseClient } from '@kings/db'
import { Card, Button, Badge } from '@kings/ui'
import { revalidatePath } from 'next/cache'

export default async function ModeracaoPage() {
  const supabase = await createServerSupabaseClient()
  
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
    const s = await createServerSupabaseClient()
    await s.from('marketplace_listings').update({ status: 'active' }).eq('id', id)
    revalidatePath('/admin/moderacao')
  }

  // Server Action para rejeitar
  async function rejectListing(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const reason = formData.get('reason') as string
    const s = await createServerSupabaseClient()
    await s.from('marketplace_listings').update({ 
      status: 'rejected', 
      rejection_reason: reason 
    }).eq('id', id)
    revalidatePath('/admin/moderacao')
  }

  return (
    <div>
      <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Fila de Moderação (MSU)</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Aprove ou rejeite classificados submetidos por pilotos do Marketplace.</p>

      {error && <div style={{ color: 'var(--danger)' }}>Erro: {error.message}</div>}

      {pendentes?.length === 0 && (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          🎉 Tudo limpo! Não há anúncios pendentes para revisão.
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {pendentes?.map((item) => (
          <Card key={item.id} style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem' }}>
            {item.images && item.images.length > 0 ? (
              <img src={item.images[0]} alt="thumb" style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '0.5rem' }} />
            ) : (
              <div style={{ width: '150px', height: '150px', background: 'var(--bg-secondary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>Sem Foto</div>
            )}
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#fff' }}>{item.title}</h3>
                <Badge variant="warning">Pendente</Badge>
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>R$ {item.price}</span>
                <span>•</span>
                <span>{item.condition}</span>
                <span>•</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Vendedor: {item.seller_id.split('-')[0]}</span>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', margin: '0 0 1.5rem 0', lineHeight: 1.5 }}>{item.description}</p>
              
              <div style={{ display: 'flex', gap: '1rem' }}>
                <form action={approveListing}>
                  <input type="hidden" name="id" value={item.id} />
                  <Button type="submit">
                    ✅ Aprovar Classificado
                  </Button>
                </form>

                <form action={rejectListing} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="hidden" name="id" value={item.id} />
                  <input type="text" name="reason" placeholder="Motivo da recusa..." required style={{ border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: '#fff', padding: '0.4rem 0.75rem', borderRadius: '0.5rem', outline: 'none' }} />
                  <Button type="submit" variant="ghost" style={{ color: 'var(--danger)' }}>
                    ❌ Rejeitar
                  </Button>
                </form>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
