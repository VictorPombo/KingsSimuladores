import { createClient } from '@kings/db/client'

export async function fetchChats() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('marketplace_chats')
    .select(`
      *,
      buyer:profiles!buyer_id(id, full_name, avatar_url, created_at),
      seller:profiles!seller_id(id, full_name, avatar_url, created_at),
      listing:marketplace_listings(id, title, price, images, condition)
    `)
  if (error) console.error(error)
  return data || []
}

export async function fetchMessages(chatId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('marketplace_messages')
    .select('*')
    .eq('chat_id', chatId)
    .order('created_at', { ascending: true })
  if (error) console.error(error)
  return data || []
}

export async function sendChatMessage(chatId: string, senderId: string | null, content: string, isBlocked: boolean = false, blockReason: string | null = null) {
  const supabase = createClient()
  const { error } = await supabase
    .from('marketplace_messages')
    .insert({
      chat_id: chatId,
      sender_id: senderId,
      content,
      is_blocked: isBlocked,
      block_reason: blockReason
    })
  if (error) console.error(error)
}
