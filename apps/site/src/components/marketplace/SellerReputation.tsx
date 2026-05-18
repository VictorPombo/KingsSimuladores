'use client'

import React, { useEffect, useState } from 'react'
import { ReputationBadge, StarRating } from './ReputationBadge'

interface Props {
  sellerId: string
  sellerName: string
}

export function SellerReputation({ sellerId, sellerName }: Props) {
  const [stats, setStats] = useState<{ totalReviews: number; avgRating: number } | null>(null)

  useEffect(() => {
    fetch(`/api/reviews?user_id=${sellerId}`)
      .then(r => r.json())
      .then(data => setStats(data.stats))
      .catch(() => {})
  }, [sellerId])

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.75rem' }}>
      <div style={{ fontSize: '0.75rem', color: '#52525b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px', fontWeight: 700 }}>Vendedor</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <div style={{ width: '44px', height: '44px', background: 'rgba(0,229,255,0.08)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', border: '1px solid rgba(0,229,255,0.15)' }}>👤</div>
        <div>
          <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{sellerName}</div>
          {stats && stats.totalReviews > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <StarRating rating={stats.avgRating} size={13} />
              <span style={{ fontSize: '0.78rem', color: '#a1a1aa', fontWeight: 600 }}>{stats.avgRating}</span>
              <span style={{ fontSize: '0.7rem', color: '#52525b' }}>({stats.totalReviews} avaliações)</span>
            </div>
          ) : (
            <div style={{ fontSize: '0.78rem', color: '#52525b', marginTop: '2px' }}>Sem avaliações ainda</div>
          )}
        </div>
      </div>
      {stats && (
        <ReputationBadge totalSales={stats.totalReviews} avgRating={stats.avgRating} size="sm" />
      )}
    </div>
  )
}
