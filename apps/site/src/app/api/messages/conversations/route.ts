import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Buscar todas as mensagens onde o usuário logado é envolvido
    const { data: messages, error } = await supabase
      .from('listing_messages')
      .select(`
        *,
        sender:profiles!sender_id(full_name),
        receiver:profiles!receiver_id(full_name),
        listing:marketplace_listings(title, images)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Agrupar por listing_id e outro usuário (partner)
    const conversations = new Map()

    messages?.forEach((msg: any) => {
      const isSender = msg.sender_id === user.id
      const partnerId = isSender ? msg.receiver_id : msg.sender_id
      const partnerName = isSender ? msg.receiver?.full_name : msg.sender?.full_name
      
      const convKey = `${msg.listing_id}_${partnerId}`

      if (!conversations.has(convKey)) {
        conversations.set(convKey, {
          listing_id: msg.listing_id,
          listing_title: msg.listing?.title || 'Produto Indisponível',
          listing_image: msg.listing?.images?.[0] || '',
          partner_id: partnerId,
          partner_name: partnerName || 'Usuário',
          last_message: msg.message,
          last_message_at: msg.created_at,
          unread_count: (!isSender && !msg.is_read) ? 1 : 0
        })
      } else {
        if (!isSender && !msg.is_read) {
          const conv = conversations.get(convKey)
          conv.unread_count += 1
        }
      }
    })

    return NextResponse.json({ conversations: Array.from(conversations.values()) })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
