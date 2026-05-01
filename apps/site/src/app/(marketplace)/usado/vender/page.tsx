'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Container, Button } from '@kings/ui'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import imageCompression from 'browser-image-compression'
import { UploadCloud, X, ImageIcon, Plus } from 'lucide-react'
import { TermsModal } from '@/components/marketplace/TermsModal'
import { uploadMarketplaceImage } from './actions'

const UF_LIST = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

export default function VenderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showTerms, setShowTerms] = useState<boolean | null>(null) // null = loading
  const [uploadProgress, setUploadProgress] = useState('')
  const [generating, setGenerating] = useState(false)

  const [form, setForm] = useState({
    title: '', price: '', condition: 'good', description: '',
    brand: '', model: '', city: '', state: '',
    hasOriginalBox: false, hasUsageMarks: false,
    weight: '', width: '', height: '', length: '', zip: ''
  })

  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if user accepted terms
  useEffect(() => {
    const checkTerms = async () => {
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
    }
    checkTerms()
  }, [router])

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

  // Auto-fill city from CEP
  const preencherCep = async () => {
    if (form.zip.replace(/\D/g, '').length >= 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${form.zip.replace(/\D/g, '')}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setForm(f => ({ ...f, city: data.localidade, state: data.uf }))
        }
      } catch {}
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 5 - imageFiles.length
    const toAdd = files.slice(0, remaining)
    setImageFiles(prev => [...prev, ...toAdd])
    setImagePreviews(prev => [...prev, ...toAdd.map(f => URL.createObjectURL(f))])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (imageFiles.length === 0) return alert('Anexe pelo menos uma foto!')
    if (!form.brand || !form.model || !form.city || !form.state) return alert('Preencha Marca, Modelo, Cidade e Estado.')
    setIsSubmitting(true)

    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id || 'guest-seller'

      const uploadedUrls: string[] = []
      const options = { maxSizeMB: 1, maxWidthOrHeight: 1200, useWebWorker: true, fileType: 'image/webp' as const }

      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(`Comprimindo e subindo foto ${i + 1} de ${imageFiles.length}...`)
        const compressed = await imageCompression(imageFiles[i], options)
        const fileName = `${userId}/${Date.now()}-${i}-${Math.random().toString(36).substring(7)}.webp`

        // Convert Blob to File for FormData
        const compressedFile = new File([compressed], fileName, { type: 'image/webp' })
        
        const formData = new FormData()
        formData.append('file', compressedFile)
        formData.append('fileName', fileName)

        // Usa a Server Action para subir, ignorando RLS
        const publicUrl = await uploadMarketplaceImage(formData)
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
          has_original_box: form.hasOriginalBox, has_usage_marks: form.hasUsageMarks,
          shipping_options: {
            weight: parseFloat(form.weight), width: parseFloat(form.width),
            height: parseFloat(form.height), length: parseFloat(form.length),
            zip_origin: form.zip
          }
        })
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Falha ao anunciar')
      }
      setSuccess(true)
    } catch (e: any) {
      alert(e.message || 'Erro ao processar o anúncio.')
    } finally {
      setIsSubmitting(false)
      setUploadProgress('')
    }
  }

  // Loading state
  if (showTerms === null) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#71717a' }}>Carregando...</div>
    </div>
  )

  // Terms modal
  if (showTerms) return (
    <TermsModal onAccept={handleAcceptTerms} onCancel={() => router.push('/usado')} />
  )

  // Success
  if (success) return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '120px' }}>
      <Container style={{ textAlign: 'center' }}>
        <div style={{ background: 'rgba(10, 14, 26, 0.8)', padding: '3rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '500px', margin: '0 auto' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
          <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Equipamento na Garagem!</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
            Seu classificado foi para a fila de <strong>Moderação</strong>.
            Status: <code style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>pending_review</code>.
          </p>
          <Button onClick={() => router.push('/usado')} style={{ background: '#06b6d4', color: '#000', fontWeight: 800 }}>
            Voltar ao Paddock
          </Button>
        </div>
      </Container>
    </div>
  )

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
      <style dangerouslySetInnerHTML={{__html: `
        .vender-title { font-size: 2.5rem; }
        .vender-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 768px) {
          .vender-title { font-size: 2rem !important; }
          .vender-grid { grid-template-columns: 1fr !important; }
        }
      `}} />
      <Container>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
            VENDA SEU SETUP
          </div>
          <h1 className="vender-title" style={{ fontWeight: 900, color: '#fff', marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Anunciar Equipamento.</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Desapegue do seu hardware. A comissão só é retida em caso de venda bem-sucedida.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10, 14, 26, 0.6)', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>

            {/* Upload Multi-Image */}
            <div>
              <label style={labelStyle}>Fotos Reais do Equipamento * <span style={{ color: '#71717a', fontWeight: 400 }}>({imageFiles.length}/5)</span></label>
              <input type="file" accept="image/*" multiple ref={fileInputRef} onChange={handleImageChange} style={{ display: 'none' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                {imagePreviews.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: '12px', overflow: 'hidden', border: i === 0 ? '2px solid #06b6d4' : '1px solid rgba(255,255,255,0.1)' }}>
                    <img src={src} alt={`Foto ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#06b6d4', color: '#000', textAlign: 'center', fontSize: '0.6rem', fontWeight: 800, padding: '2px' }}>CAPA</div>}
                    <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {imageFiles.length < 5 && (
                  <div onClick={() => fileInputRef.current?.click()} style={{ aspectRatio: '1', borderRadius: '12px', border: '2px dashed rgba(6, 182, 212, 0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', background: 'rgba(6, 182, 212, 0.02)' }}>
                    <Plus size={24} color="#06b6d4" />
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
                <label style={labelStyle}>Marca *</label>
                <input required value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} type="text" placeholder="Ex: Fanatec, Moza, Simagic" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Modelo *</label>
                <input required value={form.model} onChange={e => setForm({...form, model: e.target.value})} type="text" placeholder="Ex: CSL DD, R5 Bundle" style={inputStyle} />
              </div>
            </div>

            <div className="vender-grid">
              <div>
                <label style={labelStyle}>Preço (R$) *</label>
                <input required value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="Apenas números" style={inputStyle} />
                {parseFloat(form.price) > 0 && (
                  <div style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(6, 214, 160, 0.06)', border: '1px solid rgba(6, 214, 160, 0.15)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#06d6a0', fontWeight: 700 }}>
                      Você receberá: R$ {(parseFloat(form.price) * 0.85).toFixed(2).replace('.', ',')}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '2px' }}>
                      Taxa da plataforma (15%): -R$ {(parseFloat(form.price) * 0.15).toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label style={labelStyle}>Estado de Conservação *</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} style={inputStyle}>
                  <option value="novo">Novo (Lacrado)</option>
                  <option value="like_new">Seminovo (Na caixa)</option>
                  <option value="good">Bom (Marcas sutis)</option>
                  <option value="fair">Aceitável (Marcas pesadas)</option>
                </select>
              </div>
            </div>

            {/* Checkboxes profissionais */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '12px', border: form.hasOriginalBox ? '1px solid #06d6a0' : '1px solid rgba(255,255,255,0.1)', background: form.hasOriginalBox ? 'rgba(6, 214, 160, 0.08)' : 'transparent', cursor: 'pointer', transition: 'all 0.2s', flex: 1, minWidth: '200px' }}>
                <input type="checkbox" checked={form.hasOriginalBox} onChange={e => setForm({...form, hasOriginalBox: e.target.checked})} style={{ accentColor: '#06d6a0', width: '18px', height: '18px' }} />
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

            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={labelStyle}>Descrição Honesta *</label>
                <button
                  type="button"
                  disabled={generating || !form.brand || !form.model}
                  onClick={async () => {
                    setGenerating(true)
                    try {
                      const res = await fetch('/api/ai/description', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          brand: form.brand, model: form.model, price: form.price,
                          condition: form.condition, hasBox: form.hasOriginalBox,
                          hasUsageMarks: form.hasUsageMarks, shortDescription: form.description,
                        }),
                      })
                      const data = await res.json()
                      if (data.description) setForm(f => ({ ...f, description: data.description }))
                    } catch {}
                    setGenerating(false)
                  }}
                  style={{
                    background: generating ? 'rgba(167,139,250,0.08)' : 'rgba(167,139,250,0.12)',
                    color: '#a78bfa', border: '1px solid rgba(167,139,250,0.25)',
                    padding: '4px 12px', borderRadius: '8px', fontSize: '0.75rem',
                    fontWeight: 700, cursor: generating ? 'wait' : 'pointer',
                    opacity: !form.brand || !form.model ? 0.4 : 1,
                  }}
                >
                  {generating ? '⏳ Gerando...' : '✨ Gerar com IA'}
                </button>
              </div>
              <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Tempo de uso, motivo da venda, o que acompanha, detalhes de funcionamento..." style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} />
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)' }} />

            {/* Localização + Envio */}
            <div>
              <h3 style={{ fontSize: '1.1rem', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>📍 Localização e Envio</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>O CEP preenche cidade e estado automaticamente.</p>
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
                <input required value={form.city} onChange={e => setForm({...form, city: e.target.value})} type="text" placeholder="Preenchido pelo CEP" style={inputStyle} />
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
                <label style={labelStyle}>Largura (cm) *</label>
                <input required value={form.width} onChange={e => setForm({...form, width: e.target.value})} type="number" placeholder="Ex: 40" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Altura (cm) *</label>
                <input required value={form.height} onChange={e => setForm({...form, height: e.target.value})} type="number" placeholder="Ex: 30" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Profundidade (cm) *</label>
                <input required value={form.length} onChange={e => setForm({...form, length: e.target.value})} type="number" placeholder="Ex: 40" style={inputStyle} />
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} style={{ background: '#06b6d4', color: '#000', fontSize: '1.1rem', fontWeight: 800, padding: '1.5rem', borderRadius: '0.75rem', marginTop: '1rem' }}>
              {isSubmitting ? uploadProgress || 'Processando...' : 'Publicar Anúncio (Sujeito a Moderação)'}
            </Button>
          </form>
        </div>
      </Container>
    </div>
  )
}

const labelStyle = { display: 'block' as const, fontSize: '0.95rem', color: '#e4e4e7', marginBottom: '0.5rem', fontWeight: 600 }

const inputStyle = {
  width: '100%', background: 'rgba(0, 0, 0, 0.2)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', padding: '1rem', borderRadius: '0.75rem', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s ease'
}
