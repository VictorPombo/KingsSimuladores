'use client'

import React, { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Package, Image as ImageIcon, AlertCircle, Check, X, UploadCloud } from 'lucide-react'
import imageCompression from 'browser-image-compression'
import { updateProduct } from './actions'

type ProductData = {
  id: string; title: string; slug: string; sku: string | null; price: number; price_compare: number | null
  stock: number; status: string; weight_kg: number | null; dimensions_cm: {width: number, height: number, length: number} | null; images: string[]; description: string | null
  ncm: string | null; ean: string | null; cnpj_emitente: string | null; created_at: string; updated_at: string
  brand_name: string; category_id: string | null; fabricante: string | null; attributes?: Record<string, any>
  cost_price: number | null
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '8px',
  padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8',
  textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px',
}

export function EditProductForm({ product, allCategories = [] }: { product: ProductData, allCategories?: Array<{id: string, name: string, brand_scope: string}> }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const [images, setImages] = useState<Array<{type: 'existing', url: string} | {type: 'new', file: File, preview: string}>>(
    (product.images || []).map(url => ({ type: 'existing', url }))
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Ref for Drag and Drop Reordering
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)
  
  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _images = [...images];
    const draggedItemContent = _images.splice(dragItem.current, 1)[0];
    _images.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    setImages(_images);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      const newImages = filesArray.map(file => ({
        type: 'new' as const,
        file,
        preview: URL.createObjectURL(file)
      }))
      setImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFeedback(null)
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      try {
        const finalUrls: string[] = []

        for (const img of images) {
          if (img.type === 'existing') {
            finalUrls.push(img.url)
          } else {
            // Compress image before upload to avoid Vercel 4.5MB limit and save storage
            const options = {
              maxSizeMB: 1, // Target max size 1MB
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: 'image/webp'
            }
            let fileToUpload = img.file
            try {
              fileToUpload = await imageCompression(img.file, options)
            } catch (error) {
              console.warn('Erro ao comprimir imagem, enviando original:', error)
            }

            // Upload via server-side API (uses service role key, bypasses RLS)
            const uploadForm = new FormData()
            uploadForm.append('file', fileToUpload)
            
            const res = await fetch('/api/admin/upload-image', {
              method: 'POST',
              body: uploadForm
            })
            
            if (!res.ok) {
              if (res.status === 413) {
                throw new Error('A imagem é muito pesada (máx 4MB). Tente enviar uma foto menor.')
              }
              let errorMsg = 'Erro no upload da imagem.'
              try {
                const result = await res.json()
                if (result.error) errorMsg = result.error
              } catch (e) {
                // Ignore JSON parse error for plain text error responses like 500 or 502
              }
              throw new Error(errorMsg)
            }
            
            const result = await res.json()
            finalUrls.push(result.url)
          }
        }
        form.set('images', JSON.stringify(finalUrls))

        const result = await updateProduct(product.id, form)
        if (result.success) {
          setFeedback({ type: 'success', msg: 'Produto atualizado com sucesso!' })
          router.refresh()
          setTimeout(() => router.push('/admin/produtos'), 1500)
        } else {
          setFeedback({ type: 'error', msg: result.error || 'Erro ao salvar.' })
        }
      } catch (error: any) {
        setFeedback({ type: 'error', msg: error.message || 'Erro inesperado.' })
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
                      <option value="disabled">Desativado</option>
                      <option value="archived">Arquivado</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <label style={labelStyle}>Categoria</label>
                  <select name="category_id" defaultValue={product.category_id || ''}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="">Sem Categoria</option>
                    {allCategories
                      .filter(cat => {
                         const isKings = product.brand_name?.toLowerCase().includes('kings') || product.brand_name?.toLowerCase().includes('msu');
                         const scope = isKings ? 'kings' : 'seven';
                         return cat.brand_scope === scope;
                      })
                      .map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: '14px' }}>
                  <label style={labelStyle}>Fabricante (Marca do Produto)</label>
                  <input name="fabricante" defaultValue={product.fabricante || ''} placeholder="Ex: Moza, Fanatec, Simagic" style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>
              </div>
            </div>

            {/* Images Preview */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ImageIcon size={16} color="#22d3ee" /> Imagens
                </h3>
              </div>
              <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '10px' }}>
                {images.map((img, i) => (
                  <div 
                    key={i} 
                    draggable
                    onDragStart={(e) => { dragItem.current = i; e.currentTarget.style.opacity = '0.5' }}
                    onDragEnter={(e) => { dragOverItem.current = i; e.currentTarget.style.transform = 'scale(1.05)' }}
                    onDragLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                    onDragEnd={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'scale(1)'; handleSort(); }}
                    onDragOver={(e) => e.preventDefault()}
                    style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: i === 0 ? '2px solid #8b5cf6' : '1px solid #3f424d', cursor: 'grab', transition: 'all 0.2s' }}
                    title={i === 0 ? "Foto Principal" : "Arraste para reordenar"}
                  >
                    {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(139,92,246,0.9)', color: '#fff', fontSize: '0.6rem', textAlign: 'center', padding: '2px 0', fontWeight: 'bold', zIndex: 10 }}>PRINCIPAL</div>}
                    <img src={img.type === 'existing' ? img.url : img.preview} alt={`Imagem ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', pointerEvents: 'none' }} />
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)', zIndex: 10 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <div onClick={() => fileInputRef.current?.click()} style={{ border: '1px dashed rgba(34, 211, 238, 0.4)', background: 'rgba(34, 211, 238, 0.05)', borderRadius: '8px', aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s ease', padding: '8px', textAlign: 'center' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(34, 211, 238, 0.1)'} onMouseOut={e => e.currentTarget.style.background = 'rgba(34, 211, 238, 0.05)'}>
                  <UploadCloud size={20} color="#22d3ee" style={{ marginBottom: '4px' }} />
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.65rem' }}>Adicionar</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Pricing Card */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>💰 Preços & Estoque</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Preço de Custo (R$)</label>
                    <input name="cost_price" type="number" step="0.01" defaultValue={product.cost_price || ''} style={{ ...inputStyle, background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                      onFocus={e => e.currentTarget.style.borderColor = '#ef4444'} onBlur={e => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'} title="Visível apenas para Administradores" />
                  </div>
                  <div>
                    <label style={labelStyle}>Preço de Venda (R$) *</label>
                    <input name="price" type="number" step="0.01" defaultValue={product.price} required style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Preço Promocional (De)</label>
                    <input name="price_compare" type="number" step="0.01" defaultValue={product.price_compare || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Estoque (unidades) *</label>
                  <input name="stock" type="number" defaultValue={product.stock} required style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>

                <div>
                  <label style={labelStyle}>Quando acabar o estoque do produto</label>
                  <select name="out_of_stock_behavior" defaultValue={(product.attributes as any)?.out_of_stock_behavior || 'unavailable'} style={{ ...inputStyle, cursor: 'pointer' }}>
                    <option value="unavailable">Tornar o produto indisponível</option>
                    <option value="immediate">Continuar vendendo com disponibilidade imediata</option>
                    <option value="1_day">Continuar vendendo com disponibilidade de 1 dia útil</option>
                    <option value="2_days">Continuar vendendo com disponibilidade de 2 dias úteis</option>
                    <option value="3_days">Continuar vendendo com disponibilidade de 3 dias úteis</option>
                    <option value="4_days">Continuar vendendo com disponibilidade de 4 dias úteis</option>
                    <option value="5_days">Continuar vendendo com disponibilidade de 5 dias úteis</option>
                    <option value="6_days">Continuar vendendo com disponibilidade de 6 dias úteis</option>
                    <option value="7_days">Continuar vendendo com disponibilidade de 7 dias úteis</option>
                    <option value="10_days">Continuar vendendo com disponibilidade de 10 dias úteis</option>
                    <option value="15_days">Continuar vendendo com disponibilidade de 15 dias úteis</option>
                    <option value="20_days">Continuar vendendo com disponibilidade de 20 dias úteis</option>
                    <option value="30_days">Continuar vendendo com disponibilidade de 30 dias úteis</option>
                    <option value="45_days">Continuar vendendo com disponibilidade de 45 dias úteis</option>
                    <option value="60_days">Continuar vendendo com disponibilidade de 60 dias úteis</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Fiscal/Logistics Card */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '20px' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '16px' }}>📦 Logística & Fiscal</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>Peso (kg)</label>
                    <input name="weight_kg" type="number" step="0.01" defaultValue={product.weight_kg || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Largura (cm)</label>
                    <input name="width" type="number" step="0.01" defaultValue={product.dimensions_cm?.width || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Altura (cm)</label>
                    <input name="height" type="number" step="0.01" defaultValue={product.dimensions_cm?.height || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>Comprim. (cm)</label>
                    <input name="length" type="number" step="0.01" defaultValue={product.dimensions_cm?.length || ''} style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{...labelStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <span>NCM</span>
                      <span title="Simulador = 9504.50.00 | Assento/Cadeira = 9401.99.00 | Componente Eletrônico = 8543.70.99" style={{ cursor: 'help', color: '#64748b', background: '#3f424d', padding: '2px 6px', borderRadius: '10px', fontSize: '0.65rem' }}>Dica</span>
                    </label>
                    <input name="ncm" defaultValue={product.ncm || ''} placeholder="0000.00.00" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                  <div>
                    <label style={labelStyle}>EAN / GTIN</label>
                    <input name="ean" defaultValue={product.ean || ''} placeholder="7890000000000" style={inputStyle}
                      onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>CNPJ Emitente</label>
                  <input name="cnpj_emitente" defaultValue={product.cnpj_emitente || (product.brand_name === 'seven' ? '61.219.783/0001-93' : '29.688.089/0001-02')} placeholder="00.000.000/0000-00" style={inputStyle}
                    onFocus={e => e.currentTarget.style.borderColor = '#8b5cf6'} onBlur={e => e.currentTarget.style.borderColor = '#3f424d'} />
                </div>
              </div>
            </div>

            {/* Metadata Info */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#64748b' }}>Loja Origem: </span>
                  <span style={{ color: '#e2e8f0' }}>{product.brand_name}</span>
                </div>
                <div>
                  <span style={{ color: '#64748b' }}>Categoria: </span>
                  <span style={{ color: '#e2e8f0' }}>{allCategories.find(c => c.id === product.category_id)?.name || '—'}</span>
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
