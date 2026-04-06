// @ts-nocheck
import React from 'react'
import { Container } from '@kings/ui'
import { createAdminClient } from '@kings/db'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const supabase = createAdminClient()
  
  // Hardcoded seller ID for Wave 1 mockup (matches vender/route.ts)
  const mockSellerId = 'ae8f8bc9-dc8f-470d-b6f1-839a51d679a9'

  const { data: meusAnunciosData } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('seller_id', mockSellerId)
    .order('created_at', { ascending: false })

  const meusAnuncios = meusAnunciosData as any[]

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', paddingTop: '100px' }}>
      <Container>
        <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, marginBottom: '2rem' }}>Minha Garagem (MSU)</h1>

        <h2 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginBottom: '1rem' }}>Meus Desapegos</h2>
        
        {meusAnuncios?.length === 0 && (
          <p style={{ color: 'var(--text-muted)' }}>Você ainda não anunciou nada.</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {meusAnuncios?.map(anuncio => (
            <div key={anuncio.id} style={{ 
              background: 'var(--bg-card)', 
              padding: '1.5rem', 
              borderRadius: '0.75rem', 
              border: `1px solid ${anuncio.status === 'rejected' ? '#ef4444' : 'var(--border)'}`,
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center'
            }}>
              <img src={anuncio.images[0]} alt="thumb" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.25rem' }} />
              
              <div style={{ flex: 1 }}>
                <h3 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>{anuncio.title}</h3>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>R$ {anuncio.price}</div>
              </div>

              <div>
                {anuncio.status === 'pending_review' && <span style={{ background: '#f59e0b', color: '#000', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>EM ANÁLISE</span>}
                {anuncio.status === 'active' && <span style={{ background: '#10b981', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>ATIVO - PUBLICADO</span>}
                {anuncio.status === 'rejected' && <span style={{ background: '#ef4444', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>REJEITADO</span>}
                {anuncio.status === 'sold' && <span style={{ background: 'var(--text-muted)', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 700 }}>VENDIDO</span>}
              </div>

              {anuncio.status === 'rejected' && (
                <div style={{ width: '100%', flexBasis: '100%', marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>
                  <strong>Motivo da recusa:</strong> {anuncio.rejection_reason}
                </div>
              )}
            </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
