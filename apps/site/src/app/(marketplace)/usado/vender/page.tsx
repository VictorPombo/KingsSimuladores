'use client'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Container, Button } from '@kings/ui'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import imageCompression from 'browser-image-compression'
import Cropper from 'react-easy-crop'
import { X, Plus, ZoomIn, ZoomOut, Check, Crop } from 'lucide-react'
import { TermsModal } from '@/components/marketplace/TermsModal'
import { uploadMarketplaceImage } from './actions'

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

// Helper: recorta a imagem do canvas com as coordenadas do react-easy-crop
async function getCroppedImageBlob(imageSrc: string, pixelCrop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', reject)
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = imageSrc
  })

  const canvas = document.createElement('canvas')
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, pixelCrop.width, pixelCrop.height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(blob => {
      if (blob) resolve(blob)
      else reject(new Error('Falha ao gerar imagem recortada'))
    }, 'image/webp', 0.92)
  })
}

interface CroppedFile {
  previewUrl: string
  blob: Blob
  originalName: string
}

export default function VenderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [showTerms, setShowTerms] = useState<boolean | null>(null)
  const [categories, setCategories] = useState<any[]>([])

  const [form, setForm] = useState({
    title: '', price: '', condition: 'good', description: '',
    brand: '', model: '', city: '', state: '', category_id: '',
    hasOriginalBox: false, hasUsageMarks: false, highlight: false,
    weight: '', width: '', height: '', length: '', zip: ''
  })

  // Imagens já recortadas e prontas para upload
  const [croppedFiles, setCroppedFiles] = useState<CroppedFile[]>([])

  // Fila de imagens para recortar
  const [cropQueue, setCropQueue] = useState<File[]>([])

  // Estado do modal de crop
  const [cropModal, setCropModal] = useState<{
    open: boolean
    src: string
    originalName: string
    crop: { x: number; y: number }
    zoom: number
    croppedAreaPixels: any
  }>({
    open: false, src: '', originalName: '', crop: { x: 0, y: 0 }, zoom: 1, croppedAreaPixels: null
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Initialization
  useEffect(() => {
    const init = async () => {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) { router.push('/usado/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('accepted_listing_terms_at')
        .eq('auth_id', session.user.id)
        .single()

      setShowTerms(!profile?.accepted_listing_terms_at)

      const { data: cats } = await supabase.from('categories').select('id, name').order('name')
      if (cats) setCategories(cats)
    }
    init()
  }, [router])

  // Processa a fila de crop
  useEffect(() => {
    if (cropQueue.length > 0 && !cropModal.open) {
      // Limite de 5 fotos (contando as já recortadas e a fila)
      if (croppedFiles.length >= 5) {
        alert('Limite máximo de 5 fotos atingido.')
        setCropQueue([])
        return
      }

      const file = cropQueue[0]
      const reader = new FileReader()
      reader.onload = () => {
        setCropModal({
          open: true,
          src: reader.result as string,
          originalName: file.name,
          crop: { x: 0, y: 0 },
          zoom: 1,
          croppedAreaPixels: null
        })
      }
      reader.readAsDataURL(file)
    }
  }, [cropQueue, cropModal.open, croppedFiles.length])

  const handleAcceptTerms = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      await supabase.from('profiles')
        .update({ accepted_listing_terms_at: new Date().toISOString() })
        .eq('auth_id', session.user.id)
    }
    setShowTerms(false)
  }

  const preencherCep = async () => {
    if (form.zip.replace(/\D/g, '').length >= 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${form.zip.replace(/\D/g, '')}/json/`)
        const data = await res.json()
        if (!data.erro) setForm(f => ({ ...f, city: data.localidade, state: data.uf }))
      } catch {}
    }
  }

  // Adiciona arquivos à fila de crop
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(f => f.type.startsWith('image/') && f.size <= 10 * 1024 * 1024)
    
    if (validFiles.length < files.length) {
      alert('Algumas imagens eram inválidas ou maiores que 10MB e foram ignoradas.')
    }

    if (validFiles.length + croppedFiles.length > 5) {
      alert(`Você só pode adicionar mais ${5 - croppedFiles.length} foto(s).`)
      const allowedFiles = validFiles.slice(0, 5 - croppedFiles.length)
      setCropQueue(prev => [...prev, ...allowedFiles])
    } else {
      setCropQueue(prev => [...prev, ...validFiles])
    }

    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCropModal(prev => ({ ...prev, croppedAreaPixels }))
  }, [])

  const handleConfirmCrop = async () => {
    if (!cropModal.croppedAreaPixels) return
    try {
      const blob = await getCroppedImageBlob(cropModal.src, cropModal.croppedAreaPixels)
      const previewUrl = URL.createObjectURL(blob)
      setCroppedFiles(prev => [...prev, { previewUrl, blob, originalName: cropModal.originalName }])
      
      // Fecha o modal e remove da fila para puxar o próximo
      setCropModal(prev => ({ ...prev, open: false, src: '' }))
      setCropQueue(prev => prev.slice(1))
    } catch (err) {
      alert('Erro ao recortar imagem. Tente novamente.')
    }
  }

  const handleCancelCrop = () => {
    // Fecha o modal e remove da fila (ignora essa imagem)
    setCropModal(prev => ({ ...prev, open: false, src: '' }))
    setCropQueue(prev => prev.slice(1))
  }

  const removeImage = (index: number) => {
    URL.revokeObjectURL(croppedFiles[index].previewUrl)
    setCroppedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (croppedFiles.length === 0) return alert('Anexe pelo menos uma foto!')
    if (!form.brand || !form.model || !form.city || !form.state || !form.category_id) {
      return alert('Preencha Categoria, Marca, Modelo, Cidade e Estado.')
    }
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id
      if (!userId) throw new Error('Sessão expirada. Faça login novamente.')

      const uploadedUrls: string[] = []
      const compressOptions = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/webp' as const }

      // Upload via Server Action segura (com autenticação no servidor)
      const uploadFolder = crypto.randomUUID()
      for (let i = 0; i < croppedFiles.length; i++) {
        setUploadProgress(`Comprimindo e enviando foto ${i + 1} de ${croppedFiles.length}...`)
        const croppedFile = new File([croppedFiles[i].blob], `img-${i}.webp`, { type: 'image/webp' })
        const compressed = await imageCompression(croppedFile, compressOptions)
        const fileName = `${uploadFolder}/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.webp`

        const fd = new FormData()
        fd.append('file', compressed, fileName)
        fd.append('fileName', fileName)

        const publicUrl = await uploadMarketplaceImage(fd)
        uploadedUrls.push(publicUrl)
      }

      setUploadProgress('Publicando anúncio...')

      const res = await fetch('/api/vender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title, price: parseFloat(form.price), condition: form.condition,
          imageUrls: uploadedUrls, description: form.description,
          brand: form.brand, model: form.model, city: form.city, state: form.state,
          category_id: form.category_id,
          has_original_box: form.hasOriginalBox, has_usage_marks: form.hasUsageMarks,
          shipping_options: {
            weight: parseFloat(form.weight) || null,
            width: parseFloat(form.width) || null,
            height: parseFloat(form.height) || null,
            length: parseFloat(form.length) || null,
            zip_origin: form.zip
          }
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Falha ao publicar anúncio')
      }

      const resData = await res.json()
      const listingId = resData.listingId

      if (form.highlight && listingId) {
        setUploadProgress('Gerando cobrança de destaque (R$ 30,00)...')
        const highlightRes = await fetch('/api/msu/destacar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: listingId })
        })
        const highlightData = await highlightRes.json()
        if (highlightRes.ok && highlightData.init_point) {
          window.location.href = highlightData.init_point
          return
        } else {
          alert('Anúncio criado, mas falha ao gerar destaque: ' + (highlightData.error || ''))
        }
      }

      router.push('/usado/dashboard?tab=ads')
    } catch (e: any) {
      alert(e.message || 'Erro ao processar o anúncio.')
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }

  if (showTerms === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0A0A0A' }}>
      <div style={{ color: '#E8002D' }}>Carregando...</div>
    </div>
  )

  if (showTerms) return <TermsModal onAccept={handleAcceptTerms} onCancel={() => router.push('/usado')} />

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px', position: 'relative' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .vender-title { font-size: 2.5rem; }
        .vender-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 768px) {
          .vender-title { font-size: 2rem !important; }
          .vender-grid { grid-template-columns: 1fr !important; }
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />

      {/* Overlay de Loading (Bloqueia a tela inteira durante o envio) */}
      {isSubmitting && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: '60px', height: '60px', border: '4px solid rgba(232, 0, 45, 0.2)',
            borderTopColor: '#E8002D', borderRadius: '50%',
            animation: 'spin 1s linear infinite', marginBottom: '24px'
          }} />
          <h2 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px' }}>
            Processando seu anúncio...
          </h2>
          <p style={{ color: '#06b6d4', fontSize: '1.1rem', fontWeight: 600 }}>
            {uploadProgress || 'Enviando dados...'}
          </p>
          <p style={{ color: '#a1a1aa', fontSize: '0.9rem', marginTop: '16px' }}>
            Por favor, não feche esta página.
          </p>
        </div>
      )}

      {/* Modal de Crop */}
      {cropModal.open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.92)', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#111', borderRadius: '1.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            width: 'min(92vw, 560px)', overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.8)'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Crop size={18} color="#E8002D" />
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1rem' }}>Enquadrar Foto</span>
              </div>
              <button onClick={handleCancelCrop} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ position: 'relative', height: '350px', background: '#000' }}>
              <Cropper
                image={cropModal.src}
                crop={cropModal.crop}
                zoom={cropModal.zoom}
                aspect={1}
                onCropChange={crop => setCropModal(p => ({ ...p, crop }))}
                onZoomChange={zoom => setCropModal(p => ({ ...p, zoom }))}
                onCropComplete={onCropComplete}
                style={{ containerStyle: { borderRadius: 0 } }}
              />
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <ZoomOut size={16} color="#71717a" />
                <input
                  type="range" min={1} max={3} step={0.05}
                  value={cropModal.zoom}
                  onChange={e => setCropModal(p => ({ ...p, zoom: parseFloat(e.target.value) }))}
                  style={{ flex: 1, accentColor: '#E8002D' }}
                />
                <ZoomIn size={16} color="#71717a" />
              </div>
              <p style={{ color: '#71717a', fontSize: '0.8rem', marginBottom: '16px', textAlign: 'center' }}>
                Arraste para reposicionar · Deslize o zoom para ajustar
              </p>
              <button
                type="button"
                onClick={handleConfirmCrop}
                style={{
                  width: '100%', padding: '14px', background: '#E8002D',
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontWeight: 800, fontSize: '1rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <Check size={18} /> Confirmar Enquadramento
              </button>
            </div>
          </div>
        </div>
      )}

      <Container>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#E8002D', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
            VENDA SEU SETUP
          </div>
          <h1 className="vender-title" style={{ fontWeight: 900, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Anunciar Equipamento.</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Desapegue do seu hardware. A comissão só é retida em caso de venda bem-sucedida.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#111', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>

            {/* Upload Multi-Image com Crop */}
            <div>
              <label style={labelStyle}>
                Fotos Reais do Equipamento *{' '}
                <span style={{ color: '#71717a', fontWeight: 400 }}>({croppedFiles.length}/5) — Selecione várias fotos</span>
              </label>
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileSelect} style={{ display: 'none' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                {croppedFiles.map((cf, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: i === 0 ? '2px solid #E8002D' : '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={cf.previewUrl} alt={`Foto ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#E8002D', color: '#fff', textAlign: 'center', fontSize: '0.6rem', fontWeight: 800, padding: '2px' }}>CAPA</div>}
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {croppedFiles.length < 5 && (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    style={{ aspectRatio: '1', borderRadius: '12px', border: '2px dashed rgba(232, 0, 45, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(232, 0, 45, 0.02)' }}
                  >
                    <Plus size={24} color="#E8002D" />
                    <span style={{ color: '#71717a', fontSize: '0.7rem', marginTop: '4px' }}>Adicionar</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            {/* Info do Produto */}
            <div>
              <label style={labelStyle}>Título do Anúncio *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} type="text" placeholder="Ex: Fanatec CSL DD 8Nm + Pedais" style={inputStyle} />
            </div>

            <div className="vender-grid">
              <div>
                <label style={labelStyle}>Categoria *</label>
                <select required value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} style={inputStyle}>
                  <option value="">Selecione a Categoria</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Conservação *</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} style={inputStyle}>
                  <option value="novo">Novo (Lacrado)</option>
                  <option value="like_new">Seminovo (Na caixa)</option>
                  <option value="good">Bom (Marcas sutis)</option>
                  <option value="fair">Aceitável (Marcas pesadas)</option>
                </select>
              </div>
            </div>

            <div className="vender-grid">
              <div>
                <label style={labelStyle}>Marca *</label>
                <input required value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} type="text" placeholder="Ex: Fanatec, Moza" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Modelo *</label>
                <input required value={form.model} onChange={e => setForm({...form, model: e.target.value})} type="text" placeholder="Ex: CSL DD, R5" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Preço (R$) *</label>
              <input required value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="Apenas números" min="1" style={inputStyle} />
              {parseFloat(form.price) > 0 && (
                <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(232, 0, 45, 0.06)', border: '1px solid rgba(232, 0, 45, 0.15)' }}>
                  <div style={{ fontSize: '0.85rem', color: '#E8002D', fontWeight: 700 }}>
                    Você receberá: R$ {(parseFloat(form.price) * 0.85).toFixed(2).replace('.', ',')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '2px' }}>
                    Taxa da plataforma (15%): -R$ {(parseFloat(form.price) * 0.15).toFixed(2).replace('.', ',')}
                  </div>
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: form.hasOriginalBox ? '1px solid #E8002D' : '1px solid rgba(255,255,255,0.1)', background: form.hasOriginalBox ? 'rgba(232, 0, 45, 0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', flex: 1, minWidth: '200px' }}>
                <input type="checkbox" checked={form.hasOriginalBox} onChange={e => setForm({...form, hasOriginalBox: e.target.checked})} style={{ accentColor: '#E8002D', width: '18px', height: '18px' }} />
                <div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>📦 Tem caixa original</div>
                  <div style={{ color: '#71717a', fontSize: '0.75rem' }}>O produto acompanha a embalagem</div>
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: form.hasUsageMarks ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', background: form.hasUsageMarks ? 'rgba(245, 158, 11, 0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', flex: 1, minWidth: '200px' }}>
                <input type="checkbox" checked={form.hasUsageMarks} onChange={e => setForm({...form, hasUsageMarks: e.target.checked})} style={{ accentColor: '#f59e0b', width: '18px', height: '18px' }} />
                <div>
                  <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>⚠️ Marcas de uso visíveis</div>
                  <div style={{ color: '#71717a', fontSize: '0.75rem' }}>Riscos, desgaste ou avarias</div>
                </div>
              </label>
            </div>

            {/* Destaque */}
            <div style={{ background: form.highlight ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)', border: form.highlight ? '1px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '16px', transition: 'all 0.3s' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.highlight} onChange={e => setForm({...form, highlight: e.target.checked})} style={{ accentColor: '#06b6d4', width: '20px', height: '20px', marginTop: '4px' }} />
                <div>
                  <div style={{ color: form.highlight ? '#06b6d4' : '#fff', fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    🚀 Destacar Anúncio <span style={{ background: '#06b6d4', color: '#000', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>+VISITAS</span>
                  </div>
                  <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginTop: '4px', lineHeight: 1.5 }}>
                    Seu anúncio ficará sempre no <strong>topo do catálogo</strong> por uma taxa única de <strong>R$ 30,00</strong>.
                  </div>
                </div>
              </label>
            </div>

            {/* Descrição */}
            <div>
              <label style={labelStyle}>Descrição do Equipamento *</label>
              <textarea
                required
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Descreva o tempo de uso, motivo da venda, o que acompanha e qualquer detalhe importante..."
                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
              />
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            {/* Localização + Envio */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>📍 Localização e Envio</h3>
              <p style={{ fontSize: '0.85rem', color: '#71717a', marginBottom: '1rem' }}>O CEP preenche cidade e estado automaticamente.</p>
            </div>

            <div className="vender-grid">
              <div>
                <label style={labelStyle}>CEP de Origem *</label>
                <input required value={form.zip} onChange={e => setForm({...form, zip: e.target.value})} onBlur={preencherCep} type="text" placeholder="Ex: 01000-000" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Peso Bruto (kg) *</label>
                <input required value={form.weight} onChange={e => setForm({...form, weight: e.target.value})} type="number" step="0.1" placeholder="Ex: 8.5" style={inputStyle} />
              </div>
            </div>

            <div className="vender-grid">
              <div>
                <label style={labelStyle}>Cidade *</label>
                <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} type="text" placeholder="Preenchida pelo CEP" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado (UF) *</label>
                <select required value={form.state} onChange={e => setForm({...form, state: e.target.value})} style={inputStyle}>
                  <option value="">Selecione</option>
                  {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Largura (cm)</label>
                <input value={form.width} onChange={e => setForm({...form, width: e.target.value})} type="number" placeholder="Ex: 40" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Altura (cm)</label>
                <input value={form.height} onChange={e => setForm({...form, height: e.target.value})} type="number" placeholder="Ex: 30" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Profund. (cm)</label>
                <input value={form.length} onChange={e => setForm({...form, length: e.target.value})} type="number" placeholder="Ex: 40" style={inputStyle} />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              style={{ background: '#E8002D', color: '#fff', fontSize: '1.1rem', fontWeight: 800, padding: '1.5rem', borderRadius: '0.75rem', marginTop: '1rem', border: 'none', transition: 'background 0.2s', cursor: isSubmitting ? 'not-allowed' : 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
            >
              {isSubmitting ? uploadProgress || 'Processando...' : '🚀 Publicar Anúncio'}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  )
}

const labelStyle = { display: 'block' as const, fontSize: '0.95rem', color: '#e4e4e7', marginBottom: '0.5rem', fontWeight: 600 }

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '1rem', borderRadius: '0.75rem', outline: 'none', fontSize: '1rem',
  transition: 'border-color 0.2s ease', boxSizing: 'border-box'
}
