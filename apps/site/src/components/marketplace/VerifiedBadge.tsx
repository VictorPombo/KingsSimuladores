'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { createClient } from '@kings/db/client'

export function VerifiedBadge({ sellerId }: { sellerId: string }) {
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    async function checkVerification() {
      if (!sellerId) return
      const supabase = createClient()
      const { count } = await supabase
        .from('marketplace_orders')
        .select('*', { count: 'exact', head: true })
        .eq('seller_id', sellerId)
        .in('status', ['delivered', 'completed', 'paid', 'shipped']) // Considerando vendas bem sucedidas

      if (count && count >= 3) {
        setIsVerified(true)
      }
    }
    checkVerification()
  }, [sellerId])

  if (!isVerified) return null

  return (
    <span style={{ 
      display: 'inline-flex', alignItems: 'center', gap: '4px', 
      background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', 
      border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 6px', 
      borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.5px', marginLeft: '6px'
    }} title="Vendedor Verificado (3+ vendas concluídas)">
      <CheckCircle size={12} /> Verificado
    </span>
  )
}
