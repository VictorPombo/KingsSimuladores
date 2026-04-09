'use client'

import React, { useState, useTransition } from 'react'
import { Card, Badge, Button } from '@kings/ui'
import { EyeOff, Eye, Trash2, Edit3, Image as ImageIcon } from 'lucide-react'
import { toggleListingStatus, archiveListing } from './actions'

type Listing = {
  id: string
  title: string
  price: number
  status: string
  images: string[]
  created_at: string
}

export function MsuClient({ initialListings }: { initialListings: Listing[] }) {
  const [isPending, startTransition] = useTransition()
  
  const handleToggle = (id: string, currentStatus: string) => {
    startTransition(async () => {
      await toggleListingStatus(id, currentStatus)
    })
  }

  const handleArchive = (id: string) => {
    if (confirm('Tem certeza que deseja remover este anúncio? Ele será ocultado de todas as vitrines.')) {
      startTransition(async () => {
        await archiveListing(id)
      })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', opacity: isPending ? 0.6 : 1, transition: 'opacity 0.2s' }}>
      {initialListings?.map(listing => (
        <Card key={listing.id} style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--bg-secondary)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <ImageIcon size={24} color="#3f424d" />
              )}
            </div>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0', color: (listing.status === 'pending_review' || listing.status === 'rejected') ? '#64748b' : '#fff', fontSize: '1rem' }}>
                {listing.title}
              </h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                R$ {listing.price}
              </div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Badge variant={
              listing.status === 'active' ? 'success' : 
              listing.status === 'pending_review' ? 'warning' : 
              listing.status === 'rejected' ? 'danger' : 'info'
            }>
              {listing.status}
            </Badge>
            
            {/* Ações Administrativas */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => alert('[FASE 5] - A edição detalhada dos formulários MSU será implementada na próxima fase. ID: ' + listing.id)}
                title="Editar Anúncio"
                style={{ padding: '8px', color: '#94a3b8' }}
              >
                <Edit3 size={16} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleToggle(listing.id, listing.status)}
                title={listing.status === 'active' ? 'Ocultar/Pausar' : 'Reativar'}
                style={{ padding: '8px', color: listing.status === 'active' ? '#eab308' : '#22c55e' }}
              >
                {listing.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleArchive(listing.id)}
                title="Deletar"
                style={{ padding: '8px', color: '#ef4444' }}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </div>
        </Card>
      ))}
      
      {initialListings?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', border: '1px solid var(--border)', borderRadius: '1rem' }}>
          Nenhum anúncio encontrado.
        </div>
      )}
    </div>
  )
}
