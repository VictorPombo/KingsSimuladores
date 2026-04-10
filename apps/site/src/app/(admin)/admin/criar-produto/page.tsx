'use client'

import React, { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, DollarSign, Archive, Settings, Loader2, CheckCircle, AlertTriangle, Grid3X3, Trash2 } from 'lucide-react'
import { getBrands, getCategories, createProduct, getVariationGrids } from './actions'

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }
const sectionStyle: React.CSSProperties = { background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }
const sectionTitleStyle: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }

export default function CriarProdutoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [variationGrids, setVariationGrids] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Variáveis da Grade
  const [hasVariations, setHasVariations] = useState(false)
  const [selectedGridId, setSelectedGridId] = useState('')
  const [variationsData, setVariationsData] = useState<{ opt: string; sku: string; price: string; stock: number }[]>([])

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
  const [ncm, setNcm] = useState('')
  const [ean, setEan] = useState('')
  const [cnpjEmitente, setCnpjEmitente] = useState('')

  useEffect(() => {
    getBrands().then(setBrands)
    getCategories().then(setCategories)
    getVariationGrids().then(setVariationGrids)
  }, [])

  useEffect(() => {
    setSlug(title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))
  }, [title])

  async function handleSubmit() {
    setError(''); setSuccess('')
    
    // Regra Rígida Omnichannel
    if (!title || !price || !brandId || !ncm || !ean || !weightKg || !width || !height || !length || !cnpjEmitente) { 
      setError('Todos os campos fiscais, de envio (dimensões) e básicos são OBRIGATÓRIOS para a integração ao Olist/Hub.')
      return 
    }
    
    startTransition(async () => {
      try {
        const payloadVars = hasVariations && selectedGridId 
          ? variationsData.map(v => {
              const grid = variationGrids.find(g => g.id === selectedGridId)
              return {
                sku: v.sku,
                stock: v.stock,
                price: v.price ? Number(v.price) : null,
                attributes: { [grid?.name || 'Opção']: v.opt }
              }
            })
          : []
          
        await createProduct({ 
          title, slug, description, price, priceCompare, stock: hasVariations ? 0 : stock, 
          sku, brandId, categoryId, status, weightKg, width, height, length, ncm, ean, cnpjEmitente,
          variations: payloadVars
        })
        setSuccess('Produto criado e pronto para o Hub Omnichannel!')
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
            <label style={labelStyle}>SKU do Produto Base</label>
            <input type="text" placeholder="Ex: KNG-001" value={sku} onChange={e => setSku(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
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
            <label style={labelStyle}>{hasVariations ? 'Estoque (Ignorado c/ Variação)' : 'Estoque Base *'}</label>
            <input type="number" min={0} value={stock} onChange={e => setStock(Number(e.target.value))} disabled={hasVariations} style={{...inputStyle, opacity: hasVariations ? 0.5 : 1}} onFocus={focusHandler} onBlur={blurHandler} />
          </div>
        </div>
      </div>

      {/* VARIAÇÕES */}
      <div style={{ ...sectionStyle, borderColor: hasVariations ? '#22d3ee' : '#3f424d' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: hasVariations ? '24px' : '0' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0, color: hasVariations ? '#22d3ee' : '#fff' }}><Grid3X3 size={20} color={hasVariations ? "#22d3ee" : "#64748b"} /> Variações de Estoque</h2>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: hasVariations ? '#22d3ee' : '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>
            Habilitar
            <input type="checkbox" checked={hasVariations} onChange={e => setHasVariations(e.target.checked)} style={{ accentColor: '#22d3ee', width: '16px', height: '16px' }} />
          </label>
        </div>

        {hasVariations && (
          <div style={{ padding: '20px', background: '#1f2025', borderRadius: '8px', border: '1px solid #3f424d' }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Selecione a Matriz (Grade) *</label>
              <select value={selectedGridId} onChange={e => {
                setSelectedGridId(e.target.value)
                const grid = variationGrids.find(g => g.id === e.target.value)
                if (grid && grid.options) {
                  setVariationsData(grid.options.map((opt: string) => ({ opt, sku: '', price: '', stock: 0 })))
                } else {
                  setVariationsData([])
                }
              }} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Escolha uma grade predefinida...</option>
                {variationGrids.map(g => <option key={g.id} value={g.id}>{g.name} ({g.options?.length} opções)</option>)}
              </select>
            </div>

            {selectedGridId && variationsData.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Opção</th>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>SKU Específico</th>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Estoque *</th>
                      <th style={{ textAlign: 'left', padding: '10px', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Preço Diferenciado (Opcional)</th>
                      <th style={{ textAlign: 'center', padding: '10px', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {variationsData.map((v, i) => (
                      <tr key={i} style={{ borderTop: '1px solid #3f424d' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#fff', fontSize: '0.9rem' }}>{v.opt}</td>
                        <td style={{ padding: '10px' }}>
                          <input type="text" value={v.sku} onChange={(e) => {
                            const nd = [...variationsData]; nd[i].sku = e.target.value; setVariationsData(nd);
                          }} placeholder="Automático se vazio" style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.8rem' }} />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input type="number" min={0} value={v.stock} onChange={(e) => {
                            const nd = [...variationsData]; nd[i].stock = Number(e.target.value); setVariationsData(nd);
                          }} style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.8rem' }} />
                        </td>
                        <td style={{ padding: '10px' }}>
                          <input type="number" step="0.01" value={v.price} onChange={(e) => {
                            const nd = [...variationsData]; nd[i].price = e.target.value; setVariationsData(nd);
                          }} placeholder="R$ Padrão" style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.8rem' }} />
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <button type="button" onClick={() => setVariationsData(variationsData.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
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

      {/* Envio e Fiscal (Rigid Validation) */}
      <div style={sectionStyle}>
        <div style={{...sectionTitleStyle, color: '#f43f5e'}}><Settings size={20} /> Fiscal & Omnichannel (Obrigatórios)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>NCM *</label><input type="text" placeholder="Ex: 9504.50.00" value={ncm} onChange={e => setNcm(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>EAN (Cód. Barras) *</label><input type="text" placeholder="Sem EAN = digite 'SEM GTIN'" value={ean} onChange={e => setEan(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>CNPJ Emitente *</label><input type="text" placeholder="00.000.000/0000-00" value={cnpjEmitente} onChange={e => setCnpjEmitente(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
          <div><label style={labelStyle}>Peso (kg) *</label><input type="number" step="0.001" placeholder="Ex: 5.5" value={weightKg ?? ''} onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Largura (cm) *</label><input type="number" placeholder="Ex: 30" value={width ?? ''} onChange={e => setWidth(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Altura (cm) *</label><input type="number" placeholder="Ex: 20" value={height ?? ''} onChange={e => setHeight(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          <div><label style={labelStyle}>Comprim. (cm) *</label><input type="number" placeholder="Ex: 40" value={length ?? ''} onChange={e => setLength(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
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
