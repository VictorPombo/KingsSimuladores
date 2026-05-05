'use client'

import React, { useState, useEffect, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Package, DollarSign, Archive, Settings, Loader2, CheckCircle, AlertTriangle, Grid3X3, Trash2, UploadCloud, X, ImageIcon, Image as LucideImage, Zap } from 'lucide-react'
import { getBrands, getCategories, createProduct, getVariationGrids } from './actions'
import { ProductSmartImporter } from '../components/ProductSmartImporter'
import imageCompression from 'browser-image-compression'
import { createClient } from '@kings/db/client'

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' }
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }
const sectionStyle: React.CSSProperties = { background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }
const sectionTitleStyle: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }

const RichEditor = ({ value, onChange, onFocus, onBlur }: { value: string, onChange: (val: string) => void, onFocus?: any, onBlur?: any }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value && document.activeElement !== editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);
  return (
    <div style={{ border: '1px solid #3f424d', borderRadius: '6px', overflow: 'hidden' }}>
      <div style={{ background: '#1f2025', borderBottom: '1px solid #3f424d', padding: '10px 14px', fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>✨ Editor Visual</span>
        <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 'normal' }}>(Você pode editar o texto e ver as fotos reais, não verá códigos)</span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onFocus={onFocus}
        onBlur={(e) => { onChange(e.currentTarget.innerHTML); if (onBlur) onBlur(); }}
        style={{ background: '#1f2025', color: '#fff', padding: '16px', minHeight: '300px', maxHeight: '600px', overflowY: 'auto', outline: 'none', lineHeight: 1.6 }}
      />
    </div>
  );
};

export default function CriarProdutoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [brands, setBrands] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [variationGrids, setVariationGrids] = useState<any[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [mostrarImportador, setMostrarImportador] = useState(false)
  const [extractedReviews, setExtractedReviews] = useState<any[]>([])
  const [itemType, setItemType] = useState<'product' | 'service'>('product')

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
    
    // Regra Rígida Omnichannel vs Serviço
    if (!title || !price || !brandId || !cnpjEmitente) {
      setError('Os campos básicos, preço, loja origem e CNPJ são OBRIGATÓRIOS.')
      return
    }

    if (itemType === 'product' && (!ncm || !ean || !weightKg || !width || !height || !length)) { 
      setError('Para Produtos Físicos, todos os campos fiscais (NCM/EAN) e de envio (dimensões) são OBRIGATÓRIOS para a integração ao Olist/Hub.')
      return 
    }
    
    startTransition(async () => {
      try {
        const uploadedUrls: string[] = []
        
        // 1. Processar e Enviar Imagens se existirem
        if (imageFiles.length > 0) {
          for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i]
            const options = { maxSizeMB: 1, maxWidthOrHeight: 1080, useWebWorker: true, fileType: 'image/webp' as any }
            const compressedFile = await imageCompression(file, options)
            
            const formData = new FormData()
            formData.append('file', compressedFile, file.name)
            
            const uploadRes = await fetch('/api/admin/upload-image', {
              method: 'POST',
              body: formData
            })
            
            if (!uploadRes.ok) {
               const errData = await uploadRes.json()
               console.warn("Erro da API de upload:", errData)
               throw new Error("Erro de Upload: " + (errData.error || "Falha ao enviar imagem para a nuvem."))
            }
            
            const { url } = await uploadRes.json()
            if (url) uploadedUrls.push(url)
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
          sku, brandId, categoryId, status, 
          weightKg: itemType === 'service' ? 0 : weightKg, 
          width: itemType === 'service' ? 0 : width, 
          height: itemType === 'service' ? 0 : height, 
          length: itemType === 'service' ? 0 : length, 
          ncm: itemType === 'service' ? '' : ncm, 
          ean: itemType === 'service' ? 'SEM GTIN' : ean, 
          cnpjEmitente,
          images: uploadedUrls,
          variations: payloadVars,
          fabricante,
          outOfStockBehavior,
          reviews: extractedReviews,
          itemType // Vamos passar isso para a action
        })
        setSuccess('Produto/Serviço criado com sucesso!')
        setTimeout(() => router.push('/admin/produtos'), 1500)
      } catch (e: any) { setError(e.message) }
    })
  }

  const focusHandler = (e: any) => { if (e?.currentTarget) e.currentTarget.style.borderColor = '#8b5cf6' }
  const blurHandler = (e: any) => { if (e?.currentTarget) e.currentTarget.style.borderColor = '#3f424d' }

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
                  // MANTEMOS O HTML INTACTO PARA PRESERVAR AS IMAGENS E O LAYOUT RICO DA IA
                  combinedDescription += dadosExtraidos.descricoes.descricao_completa + "\n\n<br><br>\n\n";
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
                  const parseNum = (v: any) => {
                    if (!v) return null;
                    const str = String(v).replace(',', '.');
                    const match = str.match(/[\d.]+/);
                    return match ? parseFloat(match[0]) : null;
                  };

                  if (f.ncm) setNcm(String(f.ncm).replace(/\D/g, ''));
                  if (f.ean) setEan(String(f.ean));
                  else setEan('SEM GTIN');
                  if (f.peso_kg) setWeightKg(parseNum(f.peso_kg));
                  if (f.largura_cm) setWidth(parseNum(f.largura_cm));
                  if (f.altura_cm) setHeight(parseNum(f.altura_cm));
                  if (f.comprimento_cm) setLength(parseNum(f.comprimento_cm));
                }
                if (dadosExtraidos.avaliacoes && dadosExtraidos.avaliacoes.length > 0) {
                  setExtractedReviews(dadosExtraidos.avaliacoes);
                }

                setMostrarImportador(false);
             }}
             onCancel={() => setMostrarImportador(false)} 
          />
        </div>
      )}

      {/* Info geral */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ ...sectionTitleStyle, margin: 0 }}><Package size={20} color="#8b5cf6" /> Informações gerais</h2>
          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '4px', border: '1px solid #3f424d' }}>
            <button 
              onClick={() => setItemType('product')}
              style={{ padding: '6px 14px', borderRadius: '6px', background: itemType === 'product' ? '#8b5cf6' : 'transparent', color: itemType === 'product' ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>
              Produto Físico
            </button>
            <button 
              onClick={() => setItemType('service')}
              style={{ padding: '6px 14px', borderRadius: '6px', background: itemType === 'service' ? '#3b82f6' : 'transparent', color: itemType === 'service' ? '#fff' : '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}>
              Serviço / Consultoria
            </button>
          </div>
        </div>
        
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
          <RichEditor 
            value={description} 
            onChange={setDescription} 
            onFocus={focusHandler} 
            onBlur={blurHandler} 
          />
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
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }} disabled={!brandId}>
              <option value="">{brandId ? 'Sem categoria' : 'Selecione a Loja Origem primeiro...'}</option>
              {categories
                .filter((c: any) => {
                  if (!brandId) return false;
                  const selectedBrand = brands.find((b: any) => b.id === brandId);
                  const scope = selectedBrand?.name === 'msu' ? 'kings' : selectedBrand?.name;
                  return c.brand_scope === scope;
                })
                .map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Status</label>
            <select value={status} onChange={e => setStatus(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="draft">Rascunho</option>
              <option value="active">Ativo</option>
              <option value="disabled">Desativado</option>
              <option value="archived">Arquivado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Envio e Fiscal (Rigid Validation) */}
      <div style={sectionStyle}>
        <div style={{...sectionTitleStyle, color: itemType === 'product' ? '#f43f5e' : '#3b82f6'}}><Settings size={20} /> Fiscal & Omnichannel {itemType === 'product' ? '(Obrigatórios)' : '(Configurações de Serviço)'}</div>
        
        {itemType === 'service' && (
           <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', marginBottom: '16px', color: '#60a5fa', fontSize: '0.85rem' }}>
             Como este é um Serviço/Consultoria, não será sincronizado com a Olist. O faturamento deverá ser via NFS-e (Código de Serviço/ISS) no ERP e as dimensões de frete serão ocultadas.
           </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>{itemType === 'product' ? 'NCM *' : 'Código de Serviço (ISS/LC 116) - Opcional'}</label><input type="text" placeholder={itemType === 'product' ? "Ex: 9504.50.00" : "Ex: 14.01"} value={ncm} onChange={e => setNcm(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          {itemType === 'product' && <div><label style={labelStyle}>EAN (Cód. Barras) *</label><input type="text" placeholder="Sem EAN = digite 'SEM GTIN'" value={ean} onChange={e => setEan(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>}
          <div><label style={labelStyle}>CNPJ Emitente *</label><input type="text" placeholder="00.000.000/0000-00" value={cnpjEmitente} onChange={e => setCnpjEmitente(e.target.value)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
        </div>
        
        {itemType === 'product' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
            <div><label style={labelStyle}>Peso (kg) *</label><input type="number" step="0.001" placeholder="Ex: 5.5" value={weightKg ?? ''} onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Largura (cm) *</label><input type="number" placeholder="Ex: 30" value={width ?? ''} onChange={e => setWidth(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Altura (cm) *</label><input type="number" placeholder="Ex: 20" value={height ?? ''} onChange={e => setHeight(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
            <div><label style={labelStyle}>Comprim. (cm) *</label><input type="number" placeholder="Ex: 40" value={length ?? ''} onChange={e => setLength(e.target.value ? Number(e.target.value) : null)} style={inputStyle} onFocus={focusHandler} onBlur={blurHandler} /></div>
          </div>
        )}
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
