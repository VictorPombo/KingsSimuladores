'use client'

import React, { useState, useTransition } from 'react'
import { EyeOff, Eye, Trash2, AlertCircle, Star } from 'lucide-react'
import { toggleReviewVisibility, deleteReview } from './actions'

const HIDDEN_PREFIX = '[HIDDEN]'

type Review = {
  id: string; rating: number; comment: string | null; created_at: string
  reviewer_name: string
}

export function ReviewsClient({ reviews: initialReviews }: { reviews: Review[] }) {
  const [reviews, setReviews] = useState(initialReviews)
  const [isPending, startTransition] = useTransition()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleToggleVisibility = (r: Review) => {
    startTransition(async () => {
      const res = await toggleReviewVisibility(r.id, r.comment)
      if (res.success) {
        setReviews(prev => prev.map(rev => rev.id === r.id ? { ...rev, comment: res.newComment ?? rev.comment } : rev))
      }
    })
  }

  const handleDelete = () => {
    if (!deleteConfirmId) return
    startTransition(async () => {
      const res = await deleteReview(deleteConfirmId)
      if (res.success) {
        setReviews(prev => prev.filter(r => r.id !== deleteConfirmId))
      }
      setDeleteConfirmId(null)
    })
  }

  const isHidden = (comment: string | null) => comment?.startsWith(HIDDEN_PREFIX)
  const getVisibleComment = (comment: string | null) => {
    if (!comment) return null
    return comment.startsWith(HIDDEN_PREFIX) ? comment.slice(HIDDEN_PREFIX.length) : comment
  }

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {reviews.length === 0 ? (
          <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '60px', textAlign: 'center', color: '#64748b' }}>
            <Star size={32} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.4 }} />
            Nenhuma avaliação registrada ainda.
          </div>
        ) : reviews.map(r => {
          const hidden = isHidden(r.comment)
          const visibleText = getVisibleComment(r.comment)
          return (
            <div key={r.id} style={{
              background: '#2c2e36', borderRadius: '10px', border: `1px solid ${hidden ? '#ef444430' : '#3f424d'}`, padding: '20px',
              opacity: isPending ? 0.6 : 1, transition: 'all 0.2s',
            }}>
              {/* Hidden badge */}
              {hidden && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', padding: '4px 10px', fontSize: '0.7rem', color: '#ef4444', fontWeight: 600, marginBottom: '12px' }}>
                  <EyeOff size={12} /> OCULTO — Invisível para o público
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: hidden ? 'linear-gradient(135deg, #64748b, #475569)' : 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                    color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  }}>
                    {(r.reviewer_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: hidden ? '#64748b' : '#e2e8f0', fontSize: '0.9rem', fontWeight: 600 }}>{r.reviewer_name}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px' }}>
                      {new Date(r.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[1,2,3,4,5].map(star => (
                      <span key={star} style={{ color: star <= r.rating ? '#f59e0b' : '#3f424d', fontSize: '1.1rem' }}>★</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button title={hidden ? 'Tornar visível' : 'Ocultar comentário'} onClick={() => handleToggleVisibility(r)}
                      style={{
                        background: hidden ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${hidden ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '6px', color: hidden ? '#10b981' : '#f59e0b', cursor: 'pointer', padding: '6px',
                        display: 'flex', alignItems: 'center', transition: 'all 0.2s',
                      }}>
                      {hidden ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button title="Remover avaliação" onClick={() => setDeleteConfirmId(r.id)}
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', transition: 'all 0.2s' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {visibleText && (
                <div style={{
                  color: hidden ? '#64748b' : '#cbd5e1',
                  fontSize: '0.85rem', lineHeight: '1.6', padding: '12px 16px',
                  background: '#1f2025', borderRadius: '8px',
                  borderLeft: `3px solid ${hidden ? '#ef444440' : '#8b5cf640'}`,
                  fontStyle: hidden ? 'italic' : 'normal',
                  textDecoration: hidden ? 'line-through' : 'none',
                }}>
                  "{visibleText}"
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de Confirmação */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#1f2025', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #3f424d', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
            <AlertCircle color="#ef4444" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ margin: '0 0 8px 0', color: '#fff', fontSize: '1.2rem' }}>Remover esta avaliação?</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.5' }}>
              Esta ação é permanente e irá deletar a avaliação do banco de dados. A nota e o comentário serão perdidos para sempre.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirmId(null)}
                style={{ background: 'transparent', color: '#fff', border: '1px solid #3f424d', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}>
                Cancelar
              </button>
              <button onClick={handleDelete}
                style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {isPending ? 'Removendo...' : 'Sim, Remover'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
