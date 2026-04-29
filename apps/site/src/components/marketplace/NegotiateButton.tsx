'use client'

import React, { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { Button } from '@kings/ui'
import { ChatModal } from '@/components/marketplace/ChatModal'

interface Props {
  listingId: string
  listingTitle: string
  listingPrice: number
  sellerId: string
  sellerName: string
}

export function NegotiateButton({ listingId, listingTitle, listingPrice, sellerId, sellerName }: Props) {
  const [showChat, setShowChat] = useState(false)

  return (
    <>
      <Button
        onClick={() => setShowChat(true)}
        variant="secondary"
        style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'center', width: '100%', padding: '1.25rem', fontSize: '1.1rem', fontWeight: 600, border: '1px solid rgba(6, 182, 212, 0.3)', color: '#06b6d4' }}
      >
        <MessageCircle size={20} /> Negociar na Plataforma
      </Button>

      {showChat && (
        <ChatModal
          listingId={listingId}
          listingTitle={listingTitle}
          listingPrice={listingPrice}
          sellerId={sellerId}
          sellerName={sellerName}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  )
}
