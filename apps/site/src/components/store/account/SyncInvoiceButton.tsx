'use client'

import React, { useState } from 'react'

interface SyncInvoiceButtonProps {
  orderId: string
  initialPdfUrl?: string
  invoiceId?: string
}

export function SyncInvoiceButton({ orderId, initialPdfUrl, invoiceId }: SyncInvoiceButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(initialPdfUrl || '')

  const handleSync = async () => {
    if (!invoiceId) {
      alert('Nota Fiscal ainda não registrada no banco para sincronizar.')
      return
    }

    setIsSyncing(true)
    try {
      const res = await fetch('/api/invoices/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      })
      const data = await res.json()
      
      if (data.pdf_url) {
        setPdfUrl(data.pdf_url)
        window.open(data.pdf_url, '_blank')
      } else {
        alert(data.message || data.error || 'Nota Fiscal ainda não emitida no ERP. Tente novamente mais tarde.')
      }
    } catch (err) {
      console.error(err)
      alert('Erro ao comunicar com a API de NFe.')
    } finally {
      setIsSyncing(false)
    }
  }

  if (pdfUrl) {
    return (
      <a 
        href={pdfUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: '0.25rem', color: '#f8fafc', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s', display: 'inline-block' }}
      >
        Acessar Nota Fiscal (PDF)
      </a>
    )
  }

  return (
    <button 
      onClick={handleSync}
      disabled={isSyncing}
      style={{ background: 'transparent', border: '1px solid rgba(234, 88, 12, 0.4)', padding: '0.5rem 1rem', borderRadius: '0.25rem', color: '#ea580c', cursor: isSyncing ? 'not-allowed' : 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}
      title="Clique para verificar se o ERP já emitiu o PDF da sua Nota Fiscal."
    >
      {isSyncing ? 'Buscando NFe...' : 'Puxar Nota Fiscal (PDF)'}
    </button>
  )
}
