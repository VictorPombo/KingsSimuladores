'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, DollarSign, Archive, Settings, Loader2, CheckCircle, AlertTriangle, Grid3X3, Trash2, UploadCloud, X, ImageIcon, Image as LucideImage, Zap } from 'lucide-react'
import { getBrands, getCategories, createProduct, getVariationGrids } from './actions'
import { ProductSmartImporter } from '../components/ProductSmartImporter'
import imageCompression from 'browser-image-compression'
import { createClient } from '@supabase/supabase-js'

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
  const [mostrarImportador, setMostrarImportador] = useState(false)

  // Variáveis da Grade
  const [hasVariations, setHasVariations] = useState(false)
  const [selectedGridId, setSelectedGridId] = useState('')
  const [variationsData, setVariationsData] = useState<{ opt: string; sku: string; price: string; stock: number }[]>([])

  // Fotos
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [externalImageUrls, setExternalImageUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImageFiles(prev => [...prev, ...filesArray])
      
      filesArray.forEach(file => {
        setImagePreviews(prev => [...prev, URL.createObjectURL(file)])
      })
    }
  }

  const removeImage = (index: number) => {
    // If it's an external image (loaded before uploaded files)
    if (index < externalImageUrls.length) {
      setExternalImageUrls(prev => prev.filter((_, i) => i !== index))
    } else {
      const fileIndex = index - externalImageUrls.length
      setImageFiles(prev => prev.filter((_, i) => i !== fileIndex))
    }
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  // Form
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState(0)
  const [priceCompare, setPriceCompare] = useState<number | null>(null)
  const [stock, setStock] = useState(1)
  const [outOfStockBehavior, setOutOfStockBehavior] = useState('unavailable')
  const [sku, setSku] = useState('')
  const [fabricante, setFabricante] = useState('')
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
        const uploadedUrls: string[] = []
        
        // 1. Processar e Enviar Imagens se existirem
        if (imageFiles.length > 0) {
          const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
          )
          
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i]
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1080, useWebWorker: true, fileType: 'image/webp' as any }
            const compressedFile = await imageCompression(file, options)
            const fileName = `catalog/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
            
            const { error: uploadErr } = await supabase.storage.from('produtos').upload(fileName, compressedFile, { cacheControl: '3600' })
            if (uploadErr) {
               console.warn("Erro ao fazer upload da img, avisar admin para criar o bucket 'produtos'.", uploadErr)
               throw new Error("Erro de Upload: Verifique se o bucket 'produtos' existe e está público no Supabase.")
            }
            
            const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(fileName)
            uploadedUrls.push(publicUrl)
          }
        }
        
        // Add external URLs that weren't uploaded by user but imported by AI
        uploadedUrls.push(...externalImageUrls)

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
          images: uploadedUrls,
          variations: payloadVars,
          fabricante,
          outOfStockBehavior
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <a href="/admin/produtos" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid #3f424d', borderRadius: '8px', padding: '8px 14px', color: '#cbd5e1', textDecoration: 'none' }}><ArrowLeft size={16} /></a>
          <div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Produtos /</div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Criar produto</h1>
          </div>
        </div>
        <button 
          onClick={() => setMostrarImportador(!mostrarImportador)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6', borderRadius: '8px', padding: '8px 16px', color: '#60a5fa', fontWeight: 600, cursor: 'pointer', outline: 'none' }}
        >
          <Zap size={16} />
          Importação com IA
        </button>
      </div>

      {mostrarImportador && (
        <div style={{ marginBottom: '28px' }}>
          <ProductSmartImporter 
             onImportComplete={(dadosExtraidos) => {
                console.log("JSON perfeito entregue pela IA:", dadosExtraidos)
                
                if (dadosExtraidos.produto?.titulo) setTitle(dadosExtraidos.produto.titulo);
                if (dadosExtraidos.produto?.modelo) setSku(dadosExtraidos.produto.modelo);
                
                // Regra de Ouro: Só preenche o preço de venda automaticamente se for Real (BRL)
                if (dadosExtraidos.produto?.preco_referencia && dadosExtraidos.produto?.moeda === 'BRL') {
                   setPrice(dadosExtraidos.produto.preco_referencia);
                }
                
                if (dadosExtraidos.produto?.marca) {
                  setFabricante(dadosExtraidos.produto.marca)
                  const matchBrand = brands.find(b => b.name.toLowerCase() === dadosExtraidos.produto.marca.toLowerCase() || b.display_name?.toLowerCase() === dadosExtraidos.produto.marca.toLowerCase());
                  if (matchBrand) setBrandId(matchBrand.id);
                }
                
                if (dadosExtraidos.imagens && dadosExtraidos.imagens.length > 0) {
                  const urls = dadosExtraidos.imagens.map((img: any) => img.url).filter(Boolean)
                  setExternalImageUrls(prev => [...prev, ...urls])
                  setImagePreviews(prev => [...prev, ...urls])
                }
                
                let combinedDescription = "";
                if (dadosExtraidos.descricoes?.descricao_completa) {
                  // Replace <p> and <br> with newlines, then strip other HTML tags
                  let cleanDesc = dadosExtraidos.descricoes.descricao_completa
                    .replace(/<\/?p[^>]*>/gi, '\n\n')
                    .replace(/<br\s*\/?>/gi, '\n')
                    .replace(/<[^>]*>?/gm, '');
                  
                  // Clean up multiple newlines
                  cleanDesc = cleanDesc.replace(/\n\s*\n/g, '\n\n').trim();
                  
                  combinedDescription += cleanDesc + "\n\n";
                }
                if (dadosExtraidos.especificacoes && dadosExtraidos.especificacoes.length > 0) {
                   combinedDescription += "ESPECIFICAÇÕES TÉCNICAS\n\n";
                   dadosExtraidos.especificacoes.forEach((g: any) => {
                     g.itens?.forEach((i: any) => {
                       combinedDescription += `• ${i.nome}: ${i.valor}\n`;
                     });
                   });
                   combinedDescription += "\n";
                }
                if (combinedDescription) setDescription(combinedDescription.trim());

                if (dadosExtraidos.seo?.slug_sugerido) setSlug(dadosExtraidos.seo.slug_sugerido);

                if (dadosExtraidos.fiscal_e_dimensoes) {
                  const f = dadosExtraidos.fiscal_e_dimensoes;
                  if (f.ncm) setNcm(String(f.ncm).replace(/\D/g, ''));
                  if (f.ean) setEan(String(f.ean));
                  else setEan('SEM GTIN');
                  if (f.peso_kg) setWeightKg(Number(f.peso_kg));
                  if (f.largura_cm) setWidth(Number(f.largura_cm));
                  if (f.altura_cm) setHeight(Number(f.altura_cm));
                  if (f.comprimento_cm) setLength(Number(f.comprimento_cm));
                }

                setMostrarImportador(false);
             }}
             onCancel={() => setMostrarImportador(false)} 
          />
        </div>
      )}

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

      {/* GALERIA */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0 }}><LucideImage size={20} color="#3b82f6" /> Galeria de Fotos</h2>
        </div>
        
        <div>
          <input 
            type="file" 
            accept="image/*" 
            multiple
            ref={fileInputRef} 
            onChange={handleImageChange} 
            style={{ display: 'none' }} 
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {imagePreviews.map((preview, idx) => (
              <div key={idx} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: '12px', border: '1px solid #3f424d', overflow: 'hidden', background: '#1c1d22' }}>
                <img src={preview} alt={`Preview ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button type="button" onClick={() => removeImage(idx)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{ 
                border: '2px dashed rgba(59, 130, 246, 0.4)', background: 'rgba(59, 130, 246, 0.05)', 
                borderRadius: '12px', aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                cursor: 'pointer', transition: 'all 0.2s ease', padding: '16px', textAlign: 'center'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)'}
            >
              <UploadCloud size={28} color="#3b82f6" style={{ marginBottom: '12px' }} />
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Adicionar fotos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Preços */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><DollarSign size={20} color="#10b981" /> Preço e estoque</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.5fr', gap: '16px' }}>
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
          <div>
            <label style={labelStyle}>Quando acabar o estoque</label>
            <select value={outOfStockBehavior} onChange={e => setOutOfStockBehavior(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="unavailable">Tornar o produto indisponível</option>
              <option value="immediate">Continuar vendendo c/ disp. imediata</option>
              <option value="1_day">Continuar vendendo c/ disp. de 1 dia útil</option>
              <option value="2_days">Continuar vendendo c/ disp. de 2 dias úteis</option>
              <option value="3_days">Continuar vendendo c/ disp. de 3 dias úteis</option>
              <option value="4_days">Continuar vendendo c/ disp. de 4 dias úteis</option>
              <option value="5_days">Continuar vendendo c/ disp. de 5 dias úteis</option>
              <option value="6_days">Continuar vendendo c/ disp. de 6 dias úteis</option>
              <option value="7_days">Continuar vendendo c/ disp. de 7 dias úteis</option>
              <option value="10_days">Continuar vendendo c/ disp. de 10 dias úteis</option>
              <option value="15_days">Continuar vendendo c/ disp. de 15 dias úteis</option>
              <option value="20_days">Continuar vendendo c/ disp. de 20 dias úteis</option>
              <option value="30_days">Continuar vendendo c/ disp. de 30 dias úteis</option>
              <option value="45_days">Continuar vendendo c/ disp. de 45 dias úteis</option>
              <option value="60_days">Continuar vendendo c/ disp. de 60 dias úteis</option>
            </select>
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
              <div className="admin-overflow-table">
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
                        <td style={{ padding: '10px' }}>
                          <input type="text" value={v.opt} onChange={(e) => {
                            const nd = [...variationsData]; nd[i].opt = e.target.value; setVariationsData(nd);
                          }} style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.85rem', fontWeight: 'bold' }} />
                        </td>
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
                <div style={{ padding: '12px', display: 'flex', justifyContent: 'flex-start' }}>
                  <button type="button" onClick={() => setVariationsData([...variationsData, { opt: 'Nova Opção', sku: '', price: '', stock: 0 }])} style={{ padding: '8px 16px', background: 'transparent', border: '1px dashed #64748b', borderRadius: '6px', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    + Adicionar Nova Opção
                  </button>
                </div>
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
            <label style={labelStyle}>Loja Origem *</label>
            <select value={brandId} onChange={e => {
              setBrandId(e.target.value)
              const selectedBrand = brands.find(b => b.id === e.target.value)
              if (selectedBrand?.cnpj) setCnpjEmitente(selectedBrand.cnpj)
            }} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="">Selecionar...</option>
              {brands.map((b: any) => <option key={b.id} value={b.id}>{b.display_name || b.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Fabricante (Marca)</label>
            <input type="text" value={fabricante} onChange={e => setFabricante(e.target.value)} placeholder="Ex: Moza, Fanatec" style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} />
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
