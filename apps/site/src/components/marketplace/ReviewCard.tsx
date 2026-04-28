'use client'

import React from 'react'
import { StarRating } from './ReputationBadge'

interface ReviewCardProps {
  reviewerName: string
  rating: number
  comment?: string
  createdAt: string
}

export function ReviewCard({ reviewerName, rating, comment, createdAt }: ReviewCardProps) {
  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'hoje'
    if (days === 1) return 'ontem'
    if (days < 7) return `há ${days} dias`
    if (days < 30) return `há ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`
    return `há ${Math.floor(days / 30)} mês${Math.floor(days / 30) > 1 ? 'es' : ''}`
  }

  return (
    <div style={{
      padding: '16px', background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <StarRating rating={rating} size={14} />
        <span style={{ fontSize: '0.7rem', color: '#52525b' }}>{timeAgo(createdAt)}</span>
      </div>
      {comment && (
        <p style={{ margin: '0 0 8px', color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.5, fontStyle: 'italic' }}>
          &quot;{comment}&quot;
        </p>
      )}
      <div style={{ fontSize: '0.78rem', color: '#71717a' }}>— {reviewerName}</div>
    </div>
  )
}
