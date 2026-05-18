'use client'

import React from 'react'
import { Shield, Star, Award, Crown } from 'lucide-react'

interface ReputationBadgeProps {
  totalSales: number
  avgRating: number
  size?: 'sm' | 'md' | 'lg'
}

type BadgeInfo = { label: string; color: string; bg: string; border: string; icon: React.ReactNode }

function getBadgeInfo(totalSales: number, avgRating: number): BadgeInfo {
  if (totalSales >= 20 && avgRating >= 4.7) return {
    label: 'Piloto Elite', color: '#FFB700', bg: 'rgba(255,183,0,0.1)', border: 'rgba(255,183,0,0.25)',
    icon: <Crown size={14} />
  }
  if (totalSales >= 5 && avgRating >= 4.5) return {
    label: 'Vendedor Top', color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)',
    icon: <Award size={14} />
  }
  if (totalSales >= 1 && avgRating >= 4.0) return {
    label: 'Membro Confiável', color: '#06d6a0', bg: 'rgba(6,214,160,0.1)', border: 'rgba(6,214,160,0.25)',
    icon: <Shield size={14} />
  }
  return {
    label: 'Novo Membro', color: '#71717a', bg: 'rgba(113,113,122,0.1)', border: 'rgba(113,113,122,0.2)',
    icon: <Star size={14} />
  }
}

export function ReputationBadge({ totalSales, avgRating, size = 'md' }: ReputationBadgeProps) {
  const badge = getBadgeInfo(totalSales, avgRating)
  const fontSize = size === 'sm' ? '0.65rem' : size === 'lg' ? '0.85rem' : '0.75rem'
  const padding = size === 'sm' ? '3px 8px' : size === 'lg' ? '6px 14px' : '4px 10px'

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding, borderRadius: '100px', fontSize, fontWeight: 700,
      color: badge.color, background: badge.bg, border: `1px solid ${badge.border}`,
      letterSpacing: '0.3px',
    }}>
      {badge.icon} {badge.label}
    </span>
  )
}

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#FFB700' : 'transparent'} color={i <= Math.round(rating) ? '#FFB700' : '#3f3f46'} />
      ))}
    </span>
  )
}

export { getBadgeInfo }
