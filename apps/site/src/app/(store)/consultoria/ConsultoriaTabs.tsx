'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { formatPrice } from '@kings/utils'

export function ConsultoriaTabs({ products }: { products: any[] }) {
  const [activeTab, setActiveTab] = useState<'servicos' | 'video'>('video')

  return (
    <div>
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', borderBottom: '1px solid var(--border)' }}>
        <button 
          onClick={() => setActiveTab('video')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '0 0 16px 0', 
            cursor: 'pointer',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: activeTab === 'video' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'video' ? '3px solid var(--accent)' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
          className="font-display"
        >
          VÍDEO EXPLICATIVO
        </button>
        <button 
          onClick={() => setActiveTab('servicos')}
          style={{ 
            background: 'none', 
            border: 'none', 
            padding: '0 0 16px 0', 
            cursor: 'pointer',
            fontSize: '1.25rem',
            fontWeight: 700,
            color: activeTab === 'servicos' ? 'var(--text-primary)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'servicos' ? '3px solid var(--accent)' : '3px solid transparent',
            marginBottom: '-2px',
            transition: 'all 0.2s',
          }}
          className="font-display"
        >
          SERVIÇOS DISPONÍVEIS
        </button>
      </div>

      {activeTab === 'video' && (
        <div style={{ 
          width: '100%', 
          borderRadius: '16px', 
          overflow: 'hidden', 
          border: '1px solid rgba(0, 229, 255, 0.2)', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)', 
          background: '#04060b',
          aspectRatio: '16/9'
        }}>
          {/* Pode substituir o src do iframe com o link real do YouTube posteriormente */}
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/dQw4w9WgXcQ?si=kings-simuladores&autoplay=1&mute=1" 
            title="Vídeo Explicativo" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      )}

      {activeTab === 'servicos' && (
        products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius)' }}>
            <p style={{ color: 'var(--text-muted)' }}>Nenhum serviço de consultoria encontrado no momento.</p>
          </div>
        ) : (
          <div className="kings-catalog-grid">
            {products.map(product => (
              <Link key={product.id} href={`/produtos/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{ 
                  background: 'var(--bg-card)', 
                  borderRadius: 'var(--radius)', 
                  border: '1px solid var(--border)',
                  overflow: 'hidden',
                  transition: 'transform 0.2s, border-color 0.2s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ aspectRatio: '1', background: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ color: '#ccc' }}>Sem Imagem</div>
                    )}
                  </div>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.4 }}>{product.title}</h3>
                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent)' }}>
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}


    </div>
  )
}
