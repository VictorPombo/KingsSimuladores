import React from 'react'
import { createServerSupabaseClient } from '@kings/db'
import { revalidatePath } from 'next/cache'
import { ShieldCheck, CheckCircle, XCircle, Clock, AlertTriangle, Image as ImageIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ModeracaoPage() {
  const supabase = await createServerSupabaseClient()
  
  const { data: pendentesData, error } = await supabase
    .from('marketplace_listings')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
  
  const pendentes = (pendentesData || []) as any[]

  async function approveListing(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const s = await createServerSupabaseClient()
    await s.from('marketplace_listings').update({ status: 'active' }).eq('id', id)
    revalidatePath('/admin/moderacao')
  }

  async function rejectListing(formData: FormData) {
    'use server'
    const id = formData.get('id') as string
    const reason = formData.get('reason') as string
    const s = await createServerSupabaseClient()
    await s.from('marketplace_listings').update({ status: 'rejected', rejection_reason: reason }).eq('id', id)
    revalidatePath('/admin/moderacao')
  }

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={24} color="#06b6d4" /> Fila de Moderação
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Aprove ou rejeite classificados submetidos por pilotos</p>
        </div>

        {/* Explainer */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', borderRadius: '12px', border: '1px solid #3f424d', padding: '28px 32px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#06b6d420', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShieldCheck size={28} color="#06b6d4" /></div>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px' }}>Como funciona?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0, lineHeight: 1.6 }}>
              Quando um piloto submete um equipamento para venda, ele entra nesta fila com status <strong style={{ color: '#f59e0b' }}>Pendente</strong>. Você analisa a foto, descrição e preço, e decide aprovar ou rejeitar. <br/>
              <span style={{ color: '#64748b' }}>Anúncios aprovados aparecem imediatamente na vitrine pública do MSU. Rejeitados recebem o motivo e o vendedor é notificado.</span>
            </p>
          </div>
        </div>

        {/* KPI */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: '#2c2e36', borderRadius: '12px', padding: '20px 28px', border: '1px solid #3f424d', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f59e0b15', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Na Fila</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: pendentes.length > 0 ? '#f59e0b' : '#10b981', marginTop: '2px' }}>{pendentes.length}</div>
            </div>
          </div>
          {pendentes.length === 0 && (
            <div style={{ color: '#10b981', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> Tudo limpo! Não há anúncios pendentes.
            </div>
          )}
        </div>

        {error && <div style={{ color: '#ef4444', background: '#ef444415', border: '1px solid #ef444430', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem' }}>Erro: {error.message}</div>}

        {/* Cards de Revisão */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pendentes.map((item) => (
            <div key={item.id} style={{ background: '#2c2e36', borderRadius: '12px', border: '1px solid #f59e0b30', padding: '24px', display: 'flex', gap: '24px' }}>
              
              {/* Imagem */}
              <div style={{ width: '160px', height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#1f2025', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {item.images && item.images.length > 0 ? (
                  <img src={item.images[0]} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#3f424d' }}>
                    <ImageIcon size={32} />
                    <span style={{ fontSize: '0.7rem' }}>Sem Foto</span>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>{item.title}</h3>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#f59e0b', background: '#f59e0b15', border: '1px solid #f59e0b30', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', flexShrink: 0 }}>Pendente</span>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '16px', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1.1rem' }}>R$ {Number(item.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    <span style={{ color: '#3f424d' }}>•</span>
                    <span>{item.condition || '—'}</span>
                    <span style={{ color: '#3f424d' }}>•</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#64748b' }}>Vendedor: {item.seller_id?.split('-')[0] || '—'}</span>
                  </div>
                  
                  <p style={{ color: '#cbd5e1', fontSize: '0.9rem', margin: 0, lineHeight: 1.6, maxHeight: '4.8em', overflow: 'hidden' }}>{item.description || 'Sem descrição fornecida.'}</p>
                  
                  {/* Dados de Frete Declarados */}
                  {item.shipping_options && (
                    <div style={{ marginTop: '12px', background: '#1f2025', border: '1px dashed #3f424d', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}><span style={{ color: '#06b6d4' }}>📦 Peso:</span> {item.shipping_options.weight} kg</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}><span style={{ color: '#06b6d4' }}>📏 Dimensões:</span> {item.shipping_options.width}x{item.shipping_options.height}x{item.shipping_options.length} cm</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}><span style={{ color: '#06b6d4' }}>📍 CEP Origem:</span> {item.shipping_options.zip_origin}</span>
                    </div>
                  )}
                </div>
                
                {/* Ações */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', flexWrap: 'wrap' }}>
                  <form action={approveListing}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', borderRadius: '10px',
                      padding: '10px 24px', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.2s'
                    }}>
                      <CheckCircle size={16} /> Aprovar
                    </button>
                  </form>

                  <form action={rejectListing} style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '400px' }}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="text" name="reason" placeholder="Motivo da recusa..." required style={{
                      flex: 1, background: '#1f2025', border: '1px solid #3f424d', borderRadius: '8px',
                      padding: '10px 14px', color: '#fff', fontSize: '0.85rem', outline: 'none'
                    }} />
                    <button type="submit" style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      background: '#ef444415', border: '1px solid #ef444430', borderRadius: '10px',
                      padding: '10px 20px', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                    }}>
                      <XCircle size={16} /> Rejeitar
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
