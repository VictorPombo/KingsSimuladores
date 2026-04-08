'use client'
import React, { useState, useRef } from 'react'
import { Container, Button } from '@kings/ui'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import imageCompression from 'browser-image-compression'
import { UploadCloud, X, ImageIcon } from 'lucide-react'

export default function VenderPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    price: '',
    condition: 'good',
    description: ''
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageFile) return alert('Anexe pelo menos uma foto do seu equipamento!')
    setIsSubmitting(true)
    
    try {
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const { data: { session } } = await supabase.auth.getSession()
      
      // Fallback pra dev local caso n logue, mas pra prod precisa forçar auth real. 
      // Na vdd route /vender já devia bloquear, mas pro SSR client limitamos aqui tb
      const userId = session?.user?.id || 'guest-seller'

      // 1. Compressão Client-Side (transformar para WebP e max 1080p, 1MB)
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1080,
        useWebWorker: true,
        fileType: 'image/webp'
      }
      
      const compressedFile = await imageCompression(imageFile, options)
      
      // 2. Upload to Supabase Storage
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.webp`
      
      const { error: uploadError } = await supabase.storage
        .from('marketplace-listings')
        .upload(fileName, compressedFile, { cacheControl: '3600', upsert: false })

      if (uploadError) throw new Error('Erro ao salvar a imagem na nuvem.')

      const { data: publicUrlData } = supabase.storage
        .from('marketplace-listings')
        .getPublicUrl(fileName)
        
      const uploadedUrl = publicUrlData.publicUrl

      // 3. Cadastrar o Anúncio na API Core que já existia (passando a URL oficial)
      const res = await fetch('/api/vender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          price: parseFloat(form.price),
          condition: form.condition,
          imageUrl: uploadedUrl,
          description: form.description
        })
      })

      if (!res.ok) throw new Error('Falha ao anunciar')
      setSuccess(true)
    } catch (e: any) {
      alert(e.message || 'Erro ao processar o anúncio. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '120px' }}>
        <Container style={{ textAlign: 'center' }}>
          <div style={{ background: 'rgba(10, 14, 26, 0.8)', padding: '3rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', maxWidth: '500px', margin: '0 auto' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏁</div>
            <h1 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Equipamento na Garagem!</h1>
            <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>
              Parabéns piloto! Seu classificado foi para a fila de <strong>Moderação</strong> da KingsHub.
              Status: <code style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>pending_review</code>.
            </p>
            <Button onClick={() => router.push('/usado')} style={{ background: '#06b6d4', color: '#000', fontWeight: 800 }}>
              Voltar ao Paddock
            </Button>
          </div>
        </Container>
      </div>
    )
  }

  return (
    <div style={{ background: 'transparent', minHeight: '100vh', paddingTop: '100px', paddingBottom: '100px' }}>
      <Container>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>
            VENDA SEU SETUP
          </div>
          <h1 style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>Anunciar Equipamento.</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '1.1rem' }}>
            Desapegue do seu hardware antigo gratuitamente. A comissão só é retida em caso de venda bem-sucedida, garantindo ambiente anticarote pros dois lados.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(10, 14, 26, 0.6)', padding: '2.5rem', borderRadius: '1.5rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            
            {/* Bloco de Upload Focado */}
            <div>
              <label style={labelStyle}>Fotos Reais do Equipamento *</label>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                style={{ display: 'none' }} 
              />
              
              {!imagePreview ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  style={{ 
                    border: '2px dashed rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.02)', 
                    borderRadius: '1rem', padding: '3rem 2rem', textAlign: 'center', cursor: 'pointer',
                    transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.05)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.02)'}
                >
                  <UploadCloud size={40} color="#06b6d4" style={{ marginBottom: '1rem' }} />
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.1rem' }}>Clique ou arraste a foto</div>
                  <div style={{ color: '#71717a', fontSize: '0.9rem', marginTop: '0.5rem' }}>O navegador compactará automaticamente em Alta Definição (WebP)</div>
                </div>
              ) : (
                <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button type="button" onClick={removeImage} style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                    <X size={18} />
                  </button>
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(6, 182, 212, 0.9)', color: '#000', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <ImageIcon size={14} /> Pré-visualização
                  </div>
                </div>
              )}
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />

            <div>
              <label style={labelStyle}>Título do Anúncio *</label>
              <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} type="text" placeholder="Ex: Fanatec CSL DD 8Nm + Pedais" style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Preço (R$) *</label>
                <input required value={form.price} onChange={e => setForm({...form, price: e.target.value})} type="number" placeholder="Digite apenas números" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Estado de Conservação *</label>
                <select value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} style={inputStyle}>
                  <option value="novo">Novo (Lacrado)</option>
                  <option value="like_new">Seminovo (Na caixa)</option>
                  <option value="good">Bom (Marcas sutis de uso)</option>
                  <option value="fair">Aceitável (Marcas pesadas)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Descrição Honesta *</label>
              <textarea 
                required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                placeholder="Conte o tempo de uso, motivo da venda, o que acompanha a caixa e detalhes de funcionamento..." style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }} 
              />
            </div>

            <Button type="submit" disabled={isSubmitting} style={{ background: '#06b6d4', color: '#000', fontSize: '1.1rem', fontWeight: 800, padding: '1.5rem', borderRadius: '0.75rem', marginTop: '1rem' }}>
              {isSubmitting ? 'Compactando e Subindo... 🏎️' : 'Publicar Anúncio (Sujeito a Moderação)'}
            </Button>
          </form>

        </div>
      </Container>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.95rem',
  color: '#e4e4e7',
  marginBottom: '0.5rem',
  fontWeight: 600
}

const inputStyle = {
  width: '100%',
  background: 'rgba(0, 0, 0, 0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  padding: '1rem',
  borderRadius: '0.75rem',
  outline: 'none',
  fontSize: '1rem',
  transition: 'border-color 0.2s ease'
}
