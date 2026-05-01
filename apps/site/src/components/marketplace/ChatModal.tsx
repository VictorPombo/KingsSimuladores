'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Send, ShieldCheck, ExternalLink } from 'lucide-react'
import { createClient } from '@kings/db/client'

interface ChatModalProps {
  listingId: string
  listingTitle: string
  listingPrice: number
  partnerId: string
  partnerName: string
  onClose: () => void
}

interface Message {
  id: string
  sender_id: string
  message: string
  created_at: string
  sender?: { full_name: string }
}

export function ChatModal({ listingId, listingTitle, listingPrice, partnerId, partnerName, onClose }: ChatModalProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMsg, setNewMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    let channel: any;
    
    const init = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) setCurrentUserId(session.user.id)

      // Fetch messages
      const res = await fetch(`/api/messages?listing_id=${listingId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
      setLoading(false)

      // Realtime subscription (unique channel name prevents React 18 Strict Mode collisions)
      channel = supabase
        .channel(`listing-${listingId}-${Date.now()}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'listing_messages',
          filter: `listing_id=eq.${listingId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message])
        })
        .subscribe()
    }
    init()
    
    return () => { if (channel) channel.unsubscribe() }
  }, [listingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMsg.trim() || sending) return
    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listing_id: listingId, receiver_id: partnerId, message: newMsg })
      })
      if (res.ok) {
        const data = await res.json()
        // Only add if realtime hasn't already added it
        setMessages(prev => prev.find(m => m.id === data.message.id) ? prev : [...prev, data.message])
        setNewMsg('')
      } else {
        const errData = await res.json()
        console.error('Failed to send:', errData)
        alert('Erro ao enviar: ' + (errData.error || 'Desconhecido'))
      }
    } catch (err) {
      console.error('Catch error:', err)
      alert('Erro ao conectar com o servidor.')
    }
    setSending(false)
  }

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' }
  }

  if (!mounted) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)' }}>
      <div style={{ width: '100%', maxWidth: '520px', height: '85vh', maxHeight: '700px', background: 'linear-gradient(180deg, rgba(15,20,35,0.99) 0%, rgba(8,12,24,1) 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 80px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#06b6d4', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={12} /> Negociação Segura
            </div>
            <a href={`/usado/produto/${listingId}`} target="_blank" rel="noopener noreferrer" style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {listingTitle}
              <ExternalLink size={14} color="#06b6d4" />
            </a>
            <div style={{ color: '#71717a', fontSize: '0.8rem' }}>com {partnerName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#71717a' }}>
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {loading && <div style={{ color: '#71717a', textAlign: 'center', padding: '2rem' }}>Carregando...</div>}

          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#52525b' }}>
              <div style={{ fontSize: '2rem', marginBottom: '12px' }}>💬</div>
              <div style={{ fontWeight: 600, color: '#71717a', marginBottom: '6px' }}>Inicie a negociação</div>
              <div style={{ fontSize: '0.85rem' }}>Suas mensagens ficam salvas e protegidas pela plataforma.</div>
            </div>
          )}

          {messages.map(msg => {
            const isMine = msg.sender_id !== partnerId
            return (
              <div key={msg.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%', padding: '10px 14px', borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: isMine ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isMine ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.06)'}`,
                }}>
                  {!isMine && msg.sender && (
                    <div style={{ fontSize: '0.7rem', color: '#06b6d4', fontWeight: 700, marginBottom: '4px' }}>
                      {(msg.sender as any)?.full_name || 'Usuário'}
                    </div>
                  )}
                  <div style={{ color: '#e4e4e7', fontSize: '0.9rem', lineHeight: 1.5, wordBreak: 'break-word' }}>{msg.message}</div>
                  <div style={{ fontSize: '0.65rem', color: '#52525b', textAlign: 'right', marginTop: '4px' }}>{formatTime(msg.created_at)}</div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '8px' }}>
          <input
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Digite sua mensagem..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: '#fff', outline: 'none', fontSize: '0.9rem' }}
          />
          <button onClick={handleSend} disabled={sending || !newMsg.trim()} style={{
            background: newMsg.trim() ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)', border: 'none', borderRadius: '12px',
            width: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: newMsg.trim() ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
            color: newMsg.trim() ? '#000' : '#52525b'
          }}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
