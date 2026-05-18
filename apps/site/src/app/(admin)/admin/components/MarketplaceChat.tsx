"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, Send, Shield, ShieldAlert, Search, AlertTriangle, Ban, CheckCircle, Clock, User, Package, Bell, X, Eye, BarChart3, Rocket } from 'lucide-react'
import { filterMessage } from './chatData'
import { createClient } from '@kings/db/client'

const S = {
  card: { background:'#2c2e36', borderRadius:'10px', border:'1px solid #3f424d', overflow:'hidden' } as React.CSSProperties,
  input: { width:'100%', background:'#1f2025', border:'1px solid #3f424d', borderRadius:'6px', padding:'10px 14px', color:'#fff', fontSize:'0.9rem', outline:'none' } as React.CSSProperties,
  label: { display:'block', color:'#cbd5e1', fontSize:'0.75rem', fontWeight:600, marginBottom:'4px', textTransform:'uppercase' as const, letterSpacing:'0.5px' },
  btn: { padding:'10px 20px', borderRadius:'8px', border:'none', fontSize:'0.9rem', fontWeight:600, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', outline:'none' } as React.CSSProperties,
}

type ViewMode = 'buyer' | 'seller' | 'admin'

export function MarketplaceChat() {
  const [view, setView] = useState<ViewMode>('admin')
  const [chats, setChats] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [activeConvId, setActiveConvId] = useState<string>('')
  const [inputText, setInputText] = useState('')
  const [blockWarning, setBlockWarning] = useState('')
  const [blockCount, setBlockCount] = useState(0)
  const [searchFilter, setSearchFilter] = useState('')
  const [adminTab, setAdminTab] = useState<'chats'|'stats'>('chats')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const fetchChats = async () => {
    const { data, error } = await supabase
      .from('marketplace_chats')
      .select(`
        *,
        buyer:buyer_id(id, full_name, avatar_url, created_at),
        seller:seller_id(id, full_name, avatar_url, created_at),
        listing:listing_id(id, title, price, images, condition)
      `)
      .order('updated_at', { ascending: false })
    
    if (data) setChats(data)
  }

  const fetchMessages = async (chatId: string) => {
    const { data } = await supabase
      .from('marketplace_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  // Initial load
  useEffect(() => {
    fetchChats()
    
    // Get current logged in user to simulate views if needed
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setCurrentUserId(data.user.id)
    })
  }, [])

  // Subscribe to real-time messages
  useEffect(() => {
    if (!activeConvId) return

    fetchMessages(activeConvId)

    const channel = supabase.channel(`chat_${activeConvId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'marketplace_messages',
        filter: `chat_id=eq.${activeConvId}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new])
        
        // Push notification se estiver em background
        if (document.hidden && Notification.permission === 'granted') {
           new Notification('Nova mensagem - MSU', {
             body: payload.new.is_blocked ? 'Mensagem bloqueada' : payload.new.content,
             icon: '/logo_msu.png'
           })
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [activeConvId])

  // Scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  // Pedir permissão de notificação
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission()
    }
  }, [])

  const activeConv = chats.find(c => c.id === activeConvId)

  const getFilteredChats = useCallback(() => {
    let filtered = chats
    // Simulação das visões usando o usuário logado
    if (view === 'buyer') filtered = filtered.filter(c => c.buyer_id === currentUserId)
    else if (view === 'seller') filtered = filtered.filter(c => c.seller_id === currentUserId)
    
    if (searchFilter) {
      filtered = filtered.filter(c => {
        const title = c.listing?.title || ''
        const buyerName = c.buyer?.full_name || ''
        const sellerName = c.seller?.full_name || ''
        const term = searchFilter.toLowerCase()
        return title.toLowerCase().includes(term) || buyerName.toLowerCase().includes(term) || sellerName.toLowerCase().includes(term)
      })
    }
    return filtered
  }, [chats, view, searchFilter, currentUserId])

  const sendMessage = async () => {
    if (!inputText.trim() || !activeConv) return
    setBlockWarning('')
    
    let isBlocked = false
    let blockReason = null
    
    // Admin não passa pelo filtro
    if (view !== 'admin') {
      const result = filterMessage(inputText)
      if (result.blocked) {
        isBlocked = true
        blockReason = result.reason
        const newCount = blockCount + 1
        setBlockCount(newCount)
        setBlockWarning(newCount >= 3 ? '🚫 Tentativas repetidas resultarão em suspensão.' : `⚠️ Mensagem bloqueada: ${result.reason}`)
      }
    }

    const senderId = view === 'admin' ? null : currentUserId

    const { error } = await supabase
      .from('marketplace_messages')
      .insert({
        chat_id: activeConvId,
        sender_id: senderId,
        content: inputText,
        is_blocked: isBlocked,
        block_reason: blockReason
      })
      
    if (!error) {
      setInputText('')
      if (!isBlocked) setBlockWarning('')
      // Update chat last activity
      await supabase.from('marketplace_chats').update({ updated_at: new Date().toISOString() }).eq('id', activeConvId)
      fetchChats() // update sidebar order
    }
  }

  // Totais apenas do chat ativo para a view (ou de todos se fizéssemos um fetch completo)
  // Para fins de estatística, vamos simplificar contando das mensagens carregadas
  const totalBlocked = messages.filter(m => m.is_blocked).length

  const renderSidebar = () => {
    const convs = getFilteredChats()
    return (
      <div style={{ width:'280px', minWidth:'280px', borderRight:'1px solid #3f424d', display:'flex', flexDirection:'column', background:'#24262d' }}>
        <div style={{ padding:'16px', borderBottom:'1px solid #3f424d' }}>
          <div style={{ position:'relative' }}>
            <Search size={14} color="#64748b" style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)' }} />
            <input value={searchFilter} onChange={e => setSearchFilter(e.target.value)} placeholder="Buscar conversa..." style={{ ...S.input, paddingLeft:'32px', fontSize:'0.85rem' }} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto' }}>
          {convs.length === 0 && <div style={{ padding:'24px', textAlign:'center', color:'#64748b', fontSize:'0.85rem' }}>Nenhuma conversa. <br/><span style={{fontSize: '0.75rem', opacity: 0.7}}>Inicie um chat na página de um anúncio.</span></div>}
          {convs.map(conv => {
            const isBuyer = currentUserId === conv.buyer_id
            const otherUser = view === 'admin' ? conv.buyer : (isBuyer ? conv.seller : conv.buyer)
            const isActive = conv.id === activeConvId
            
            return (
              <div key={conv.id} onClick={() => { setActiveConvId(conv.id); setBlockWarning('') }}
                style={{ padding:'14px 16px', cursor:'pointer', borderBottom:'1px solid rgba(63,66,77,0.4)', background: isActive ? 'rgba(139,92,246,0.1)' : 'transparent', borderLeft: isActive ? '3px solid #8b5cf6' : '3px solid transparent', transition:'all 0.15s' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#3f424d', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.7rem', color:'#fff', fontWeight:700 }}>
                      {otherUser?.avatar_url ? <img src={otherUser.avatar_url} width="100%" height="100%" style={{objectFit:'cover'}}/> : (otherUser?.full_name?.substring(0,2) || 'U')}
                    </div>
                    <span style={{ color:'#fff', fontWeight:600, fontSize:'0.9rem', maxWidth:'120px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{otherUser?.full_name || 'Usuário'}</span>
                  </div>
                </div>
                <div style={{ fontSize:'0.75rem', color:'#06b6d4', marginBottom:'2px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>🎮 {conv.listing?.title}</div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'#64748b', fontSize:'0.7rem' }}>{new Date(conv.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderChat = () => {
    if (!activeConv) return <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b' }}>Selecione uma conversa</div>
    
    // Se Admin, vê tudo. Se não, oculta bloqueadas dos outros
    const visibleMessages = view === 'admin' ? messages : messages.filter(m => !m.is_blocked || m.sender_id === currentUserId)

    return (
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        <div style={{ padding:'14px 20px', borderBottom:'1px solid #3f424d', background:'#24262d', display:'flex', alignItems:'center', gap:'14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#1f2025' }}>
            {activeConv.listing?.images?.[0] && <img src={activeConv.listing.images[0]} style={{width:'100%', height:'100%', objectFit:'cover'}}/>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ color:'#fff', fontWeight:700, fontSize:'0.95rem' }}>{activeConv.listing?.title}</div>
            <div style={{ color:'#10b981', fontSize:'0.85rem', fontWeight:600 }}>R$ {Number(activeConv.listing?.price || 0).toLocaleString('pt-BR')}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>Vendedor: {activeConv.seller?.full_name}</div>
            <div style={{ color:'#94a3b8', fontSize:'0.75rem' }}>Comprador: {activeConv.buyer?.full_name}</div>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'8px' }}>
          {visibleMessages.length === 0 && <div style={{textAlign:'center', color:'#64748b', margin:'auto'}}>Envie a primeira mensagem!</div>}
          {visibleMessages.map(msg => {
            const isAdminMsg = msg.sender_id === null
            const isMe = msg.sender_id === currentUserId && !isAdminMsg
            const isBlocked = msg.is_blocked

            return (
              <div key={msg.id} style={{ display:'flex', justifyContent: isAdminMsg ? 'center' : isMe ? 'flex-end' : 'flex-start', marginBottom:'4px' }}>
                <div style={{
                  maxWidth: isAdminMsg ? '85%' : '70%', padding:'10px 14px', borderRadius: isAdminMsg ? '8px' : isMe ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  background: isBlocked && view === 'admin' ? 'rgba(239,68,68,0.15)' : isAdminMsg ? 'rgba(245,158,11,0.15)' : isMe ? '#3b82f6' : '#3f424d',
                  border: isBlocked && view === 'admin' ? '1px solid rgba(239,68,68,0.3)' : isAdminMsg ? '1px solid rgba(245,158,11,0.3)' : 'none',
                  color:'#fff', fontSize:'0.9rem', lineHeight:1.4, position:'relative'
                }}>
                  {isAdminMsg && <div style={{ fontSize:'0.7rem', color:'#f59e0b', fontWeight:700, marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px' }}><Shield size={12} /> Moderador</div>}
                  {isBlocked && view === 'admin' && (
                    <div style={{ fontSize:'0.7rem', color:'#ef4444', fontWeight:700, marginBottom:'4px', display:'flex', alignItems:'center', gap:'4px' }}>
                      <ShieldAlert size={12} /> BLOQUEADA — {msg.block_reason}
                    </div>
                  )}
                  {msg.content}
                  <div style={{ fontSize:'0.65rem', color: isMe ? 'rgba(255,255,255,0.6)' : '#94a3b8', marginTop:'4px', textAlign:'right' }}>
                    {new Date(msg.created_at).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={messagesEndRef} />
        </div>

        {blockWarning && (
          <div style={{ margin:'0 20px', padding:'10px 14px', background: blockCount >= 3 ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.1)', border: `1px solid ${blockCount >= 3 ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`, borderRadius:'8px', color: blockCount >= 3 ? '#fca5a5' : '#fcd34d', fontSize:'0.85rem', display:'flex', alignItems:'center', gap:'8px' }}>
            <AlertTriangle size={16} /> {blockWarning}
            <X size={14} style={{ marginLeft:'auto', cursor:'pointer' }} onClick={() => setBlockWarning('')} />
          </div>
        )}

        <div style={{ padding:'14px 20px', borderTop:'1px solid #3f424d', background:'#24262d', display:'flex', gap:'10px', alignItems:'center' }}>
          <input value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder={view === 'admin' ? 'Enviar como Moderador...' : 'Digite sua mensagem...'}
            style={{ ...S.input, flex:1 }} />
          <button onClick={sendMessage} style={{ ...S.btn, background: view === 'admin' ? '#f59e0b' : '#8b5cf6', padding:'10px 16px' }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    )
  }

  const renderAdminPanel = () => {
    if (!activeConv || view !== 'admin') return null
    return (
      <div style={{ width:'260px', minWidth:'260px', borderLeft:'1px solid #3f424d', background:'#24262d', overflowY:'auto', padding:'16px' }}>
        <h4 style={{ color:'#fff', fontSize:'0.85rem', fontWeight:700, marginBottom:'12px' }}>📦 Anúncio</h4>
        <div style={{ ...S.card, padding:'12px', marginBottom:'16px' }}>
          <div style={{ color:'#fff', fontSize:'0.85rem', fontWeight:600, marginBottom:'4px' }}>{activeConv.listing?.title}</div>
          <div style={{ color:'#10b981', fontSize:'0.85rem', fontWeight:700 }}>R$ {Number(activeConv.listing?.price || 0).toLocaleString('pt-BR')}</div>
          <div style={{ color:'#94a3b8', fontSize:'0.75rem', marginTop:'4px' }}>{activeConv.listing?.condition}</div>
        </div>

        <h4 style={{ color:'#fff', fontSize:'0.85rem', fontWeight:700, marginBottom:'8px' }}>🏪 Vendedor</h4>
        <div style={{ ...S.card, padding:'12px', marginBottom:'16px' }}>
          <div style={{ color:'#fff', fontSize:'0.85rem', fontWeight:600 }}>{activeConv.seller?.full_name || 'Vendedor'}</div>
        </div>

        <h4 style={{ color:'#fff', fontSize:'0.85rem', fontWeight:700, marginBottom:'8px' }}>👤 Comprador</h4>
        <div style={{ ...S.card, padding:'12px', marginBottom:'16px' }}>
          <div style={{ color:'#fff', fontSize:'0.85rem', fontWeight:600 }}>{activeConv.buyer?.full_name || 'Comprador'}</div>
        </div>
        
        <div style={{ marginTop:'16px', display:'flex', flexDirection:'column', gap:'8px' }}>
          <button style={{ ...S.btn, background:'rgba(245,158,11,0.15)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.3)', width:'100%', justifyContent:'center', fontSize:'0.8rem' }}>
            <AlertTriangle size={14} /> Advertir Usuário
          </button>
        </div>
      </div>
    )
  }

  const renderStats = () => (
    <div style={{ flex:1, padding:'24px', overflowY:'auto' }}>
      <h3 style={{ color:'#fff', fontSize:'1.1rem', fontWeight:700, marginBottom:'20px', display:'flex', alignItems:'center', gap:'8px' }}><BarChart3 size={20} color="#8b5cf6" /> Estatísticas do Chat</h3>
      <div style={{ color: '#94a3b8' }}>Estatísticas reais em construção via Supabase.</div>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'calc(100vh - 80px)', maxHeight:'calc(100vh - 80px)' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={{ display:'flex', gap:'6px', background:'#1f2025', padding:'6px', borderRadius:'12px', border:'1px solid #3f424d' }}>
          {([['buyer','👤 Comprador'],['seller','🏪 Vendedor'],['admin','🛡️ Admin']] as [ViewMode, string][]).map(([v, label]) => (
            <button key={v} onClick={() => { setView(v); setBlockWarning(''); setBlockCount(0); setActiveConvId(''); setMessages([]) }}
              style={{ padding:'8px 16px', background: view === v ? '#8b5cf6' : 'transparent', border:'none', borderRadius:'8px', color: view === v ? '#fff' : '#94a3b8', cursor:'pointer', fontSize:'0.9rem', fontWeight:600, display:'flex', alignItems:'center', gap:'6px', outline:'none', boxShadow: view === v ? '0 2px 10px rgba(139,92,246,0.3)' : 'none' }}>
              {label}
              {v === 'admin' && totalBlocked > 0 && <span style={{ background:'#ef4444', color:'#fff', borderRadius:'50%', width:'18px', height:'18px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem' }}>{totalBlocked}</span>}
            </button>
          ))}
        </div>
        {view === 'admin' && (
          <div style={{ display:'flex', gap:'6px', background:'#1f2025', padding:'4px', borderRadius:'8px', border:'1px solid #3f424d' }}>
            <button onClick={() => setAdminTab('chats')} style={{ padding:'6px 14px', background: adminTab === 'chats' ? '#3f424d' : 'transparent', border:'none', borderRadius:'6px', color:'#fff', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, outline:'none' }}>
              <MessageCircle size={14} style={{ marginRight:'4px', verticalAlign:'middle' }} /> Conversas
            </button>
            <button onClick={() => setAdminTab('stats')} style={{ padding:'6px 14px', background: adminTab === 'stats' ? '#3f424d' : 'transparent', border:'none', borderRadius:'6px', color:'#fff', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, outline:'none' }}>
              <BarChart3 size={14} style={{ marginRight:'4px', verticalAlign:'middle' }} /> Estatísticas
            </button>
          </div>
        )}
      </div>

      <div style={{ ...S.card, flex:1, display:'flex', overflow:'hidden' }}>
        {view === 'admin' && adminTab === 'stats' ? renderStats() : (
          <>
            {renderSidebar()}
            {renderChat()}
            {view === 'admin' && renderAdminPanel()}
          </>
        )}
      </div>
    </div>
  )
}
