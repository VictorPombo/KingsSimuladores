import React from 'react'
import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('http://localhost:3000/login') // Redirecionar p/ a store (ficará dinâmico na Vercel/prod)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', user.id)
    .single()

  const { data: meusAnunciosData } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false })

  const meusAnuncios = meusAnunciosData as any[]

  async function activateSeller() {
    'use server'
    const s = await createServerSupabaseClient()
    const { data: { user } } = await s.auth.getUser()
    if (user) {
      // Faz upgrade p/ seller
      await (s.from('profiles') as any).update({ role: 'seller' }).eq('auth_id', user.id)
      revalidatePath('/account')
    }
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', padding: '20px 20px 100px 20px' }}>
      <h1 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>Minha Garagem</h1>

      {(profile as any)?.role === 'client' && (
        <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6', padding: '16px', borderRadius: '12px', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem', lineHeight: 1.2 }}>Deseja vender um equipamento?</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.2rem', fontSize: '0.85rem' }}>Você precisa habilitar sua conta para o Modo Vendedor. É de graça e leva 1 segundo.</p>
          <form action={activateSeller}>
            <button type="submit" style={{ width: '100%', background: '#8b5cf6', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer' }}>
              ATIVAR MODO VENDEDOR
            </button>
          </form>
        </div>
      )}

      <h2 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Meus Desapegos</h2>
      
      {meusAnuncios?.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Você ainda não anunciou nada.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {meusAnuncios?.map(anuncio => (
          <div key={anuncio.id} style={{ 
            background: 'var(--bg-card)', 
            padding: '16px', 
            borderRadius: '12px', 
            border: `1px solid ${anuncio.status === 'rejected' ? '#ef4444' : 'var(--border)'}`,
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <img src={anuncio.images[0]} alt="thumb" style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }} />
            
            <div style={{ flex: 1, minWidth: '150px' }}>
              <h3 style={{ color: '#fff', margin: '0 0 0.2rem 0', fontSize: '1rem', lineHeight: 1.2 }}>{anuncio.title}</h3>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600 }}>R$ {anuncio.price}</div>
            </div>

            <div style={{ width: '100%' }}>
              {anuncio.status === 'pending_review' && <span style={{ background: '#f59e0b', color: '#000', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>EM ANÁLISE</span>}
              {anuncio.status === 'active' && <span style={{ background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>ATIVO</span>}
              {anuncio.status === 'rejected' && <span style={{ background: '#ef4444', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>REJEITADO</span>}
              {anuncio.status === 'sold' && <span style={{ background: 'var(--text-muted)', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 800 }}>VENDIDO</span>}
            </div>

            {anuncio.status === 'rejected' && (
              <div style={{ width: '100%', marginTop: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '12px', borderRadius: '8px', fontSize: '0.8rem' }}>
                <strong>Motivo:</strong> {anuncio.rejection_reason}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
