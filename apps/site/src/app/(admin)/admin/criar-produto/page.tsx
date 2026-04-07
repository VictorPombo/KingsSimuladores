'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, DollarSign, Archive, Settings, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { getBrands, getCategories, createProduct } from './actions'

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }
const sectionStyle: React.CSSProperties = { background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }
const sectionTitleStyle: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }

export default function CriarProdutoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [priceCompare, setPriceCompare] = useState<number | null>(null)
  const [stock, setStock] = useState(1)
  const [sku, setSku] = useState('')
  const [brandId, setBrandId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('draft')
  const [weightKg, setWeightKg] = useState<number | null>(null)
  const [width, setWidth] = useState<number | null>(null)
  const [height, setHeight] = useState<number | null>(null)
  const [length, setLength] = useState<number | null>(null)
  const [cnpjEmitente, setCnpjEmitente] = useState('')

  useEffect(() => {
    getBrands().then(setBrands)
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }, [title])

  async function handleSubmit() {
    setError(''); setSuccess('')
    if (!title || !price || !brandId) { setError('Título, preço e marca são obrigatórios.'); return }
    startTransition(async () => {
      try {
        await createProduct({ title, slug, description, price, priceCompare, stock, sku, brandId, categoryId, status, weightKg, width, height, length, cnpjEmitente })
        setSuccess('Produto criado com sucesso!')
        setTimeout(() => router.push('/admin/produtos'), 1500)
      } catch (e: any) { setError(e.message) }
    })
  }

  const focusHandler = (e: any) => e.currentTarget.style.borderColor = '#8b5cf6'
  const blurHandler = (e: any) => e.currentTarget.style.borderColor = '#3f424d'

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <a href="/admin/produtos" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid #3f424d', borderRadius: '8px', padding: '8px 14px', color: '#cbd5e1', textDecoration: 'none' }}><ArrowLeft size={16} /></a>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Produtos /</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Criar produto</h1>
        </div>
      </div>

      {/* Info geral */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><Package size={20} color="#8b5cf6" /> Informações gerais</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Nome do produto *</label>
            <input type="text" placeholder="Ex: Cockpit Simulador Pro Racing" value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
          <div>
            <label style={labelStyle}>SKU</label>
            <input type="text" placeholder="KNG-001" value={sku} onChange={e => setSku(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Slug (URL)</label>
          <input type="text" value={slug} onChange={e => setSlug(e.target.value)} style={{ ...inputStyle, color: '#64748b' }} onFocus={focusHandler} onBlur={blurHandler} />
        </div>
        <div>
          <label style={labelStyle}>Descrição</label>
          <textarea placeholder="Descreva o produto..." value={description} onChange={e => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} onFocus={focusHandler} onBlur={blurHandler} />
        </div>
      </div>

      {/* Preços */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><DollarSign size={20} color="#10b981" /> Preço e estoque</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Preço de venda *</label>
            <div style={{ display: 'flex' }}>
              <span style={{ background: '#3f424d', padding: '10px 12px', borderRadius: '6px 0 0 6px', color: '#94a3b8', fontSize: '0.85rem', border: '1px solid #3f424d', borderRight: 'none' }}>R$</span>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(Number(e.target.value))} style={{ ...inputStyle, borderRadius: '0 6px 6px 0' }} onFocus={focusHandler} onBlur={blurHandler} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Preço comparativo</label>
            <div style={{ display: 'flex' }}>
              <span style={{ background: '#3f424d', padding: '10px 12px', borderRadius: '6px 0 0 6px', color: '#94a3b8', fontSize: '0.85rem', border: '1px solid #3f424d', borderRight: 'none' }}>R$</span>
              <input type="number" step="0.01" value={priceCompare ?? ''} onChange={e => setPriceCompare(e.target.value ? Number(e.target.value) : null)} style={{ ...inputStyle, borderRadius: '0 6px 6px 0' }} onFocus={focusHandler} onBlur={blurHandler} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Estoque *</label>
            <input type="number" min={0} value={stock} onChange={e => setStock(Number(e.target.value))} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
        </div>
      </div>

      {/* Organização */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><Archive size={20} color="#f59e0b" /> Organização</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Marca *</label>
            <select value={brandId} onChange={e => setBrandId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Selecionar...</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Sem categoria</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Envio */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><Settings size={20} color="#22d3ee" /> Dados de envio</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>Peso (kg)</label><input type="number" step="0.001" value={weightKg ?? ''} onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Largura (cm)</label><input type="number" value={width ?? ''} onChange={e => setWidth(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Altura (cm)</label><input type="number" value={height ?? ''} onChange={e => setHeight(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Comprimento (cm)</label><input type="number" value={length ?? ''} onChange={e => setLength(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
        </div>
        <div style={{ maxWidth: '400px' }}>
          <label style={labelStyle}>CNPJ Emitente *</label>
          <input type="text" placeholder="00.000.000/0000-00" value={cnpjEmitente} onChange={e => setCnpjEmitente(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
        </div>
      </div>

      {error && <div style={{ padding: '12px 16px', background: '#ef444418', border: '1px solid #ef444430', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> {error}</div>}
      {success && <div style={{ padding: '12px 16px', background: '#10b98118', border: '1px solid #10b98130', borderRadius: '8px', marginBottom: '16px', color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}><CheckCircle size={16} /> {success}</div>}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '60px' }}>
        <a href="/admin/produtos" style={{ padding: '12px 28px', borderRadius: '8px', background: 'transparent', border: '1px solid #3f424d', color: '#cbd5e1', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 }}>Cancelar</a>
        <button onClick={handleSubmit} disabled={isPending} style={{
          padding: '12px 28px', borderRadius: '8px', border: 'none', fontSize: '0.9rem', fontWeight: 600,
          background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', cursor: 'pointer',
          boxShadow: '0 2px 12px rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {isPending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Criando...</> : 'Criar produto'}
        </button>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
