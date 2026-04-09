'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Image as ImageIcon, AlertCircle, Check } from 'lucide-react'
import { updateProduct } from './actions'

type ProductData = {
  id: string; title: string; slug: string; sku: string | null; price: number; price_compare: number | null
  stock: number; status: string; weight_kg: number | null; images: string[]; description: string | null
  ncm: string | null; ean: string | null; created_at: string; updated_at: string
  brand_name: string; category_name: string | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '8px',
  padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
}

export function EditProductForm({ product }: { product: ProductData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback(null)
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await updateProduct(product.id, form)
      if (result.success) {
        setFeedback({ type: 'success', msg: 'Produto atualizado com sucesso!' })
        setTimeout(() => router.push('/admin/produtos'), 1500)
      } else {
        setFeedback({ type: 'error', msg: result.error || 'Erro ao salvar.' })
      }
    })
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <button onClick={() => router.push('/admin/produtos')}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid #3f424d', borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Editar Produto</h1>
          <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '2px' }}>{product.brand_name} — {product.slug}</p>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px',
          background: feedback.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '0.85rem', fontWeight: 500,
        }}>
          {feedback.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {feedback.msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* ── Left Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Basic Info Card */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={16} color="#8b5cf6" /> Informações Básicas
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Título do Produto *</label>
                  <input name="title" defaultValue={product.title} required style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>

                <div>
                  <label style={labelStyle}>Descrição</label>
                  <textarea name="description" defaultValue={product.description || ''} rows={4}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>SKU</label>
                    <input name="sku" defaultValue={product.sku || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status *</label>
                    <select name="status" defaultValue={product.status}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="active">Ativo</option>
                      <option value="draft">Rascunho</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Images Preview */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ImageIcon size={16} color="#22d3ee" /> Imagens
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {product.images && product.images.length > 0 ? product.images.map((img, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #3f424d' }}>
                    <img src={img} alt={`Imagem ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.8rem', gridColumn: '1 / -1' }}>
                    Nenhuma imagem cadastrada.
                  </div>
                )}
              </div>
              <p style={{ color: '#4a4d57', fontSize: '0.7rem', marginTop: '10px' }}>
                Para alterar imagens, use o painel do Supabase Storage diretamente.
              </p>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Pricing Card */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>💰 Preços & Estoque</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Preço (R$) *</label>
                    <input name="price" type="number" step="0.01" defaultValue={product.price} required style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Preço Comparativo (R$)</label>
                    <input name="price_compare" type="number" step="0.01" defaultValue={product.price_compare || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Estoque (unidades) *</label>
                  <input name="stock" type="number" defaultValue={product.stock} required style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>
              </div>
            </div>

            {/* Fiscal/Logistics Card */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>📦 Logística & Fiscal</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={labelStyle}>Peso (kg)</label>
                  <input name="weight_kg" type="number" step="0.01" defaultValue={product.weight_kg || ''} style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>NCM</label>
                    <input name="ncm" defaultValue={product.ncm || ''} placeholder="0000.00.00" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>EAN / GTIN</label>
                    <input name="ean" defaultValue={product.ean || ''} placeholder="7890000000000" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Info */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Marca: </span>
                  <span style={{ color: '#e2e8f0' }}>{product.brand_name}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Categoria: </span>
                  <span style={{ color: '#e2e8f0' }}>{product.category_name || '—'}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Criado: </span>
                  <span style={{ color: '#e2e8f0' }}>{new Date(product.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Atualizado: </span>
                  <span style={{ color: '#e2e8f0' }}>{new Date(product.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px', padding: '16px 0', borderTop: '1px solid #3f424d' }}>
          <button type="button" onClick={() => router.push('/admin/produtos')}
            style={{ background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', padding: '10px 20px', color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
            Cancelar
          </button>
          <button type="submit" disabled={isPending}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: isPending ? '#4a4d57' : 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
              border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#fff',
              fontWeight: 600, fontSize: '0.85rem', cursor: isPending ? 'wait' : 'pointer',
              boxShadow: isPending ? 'none' : '0 2px 8px rgba(139,92,246,0.3)',
              transition: 'all 0.2s',
            }}>
            <Save size={16} />
            {isPending ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  )
}
