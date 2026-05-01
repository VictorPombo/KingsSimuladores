import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

// Filtra números de telefone das mensagens para segurança
function maskPhoneNumbers(text: string): string {
  return text.replace(/(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}[-\s]?\d{4}/g, '[número ocultado pela plataforma]')
}

// GET — busca mensagens de um listing
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listing_id')
    if (!listingId) return NextResponse.json({ error: 'listing_id required' }, { status: 400 })

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: messages, error } = await supabase
      .from('listing_messages')
      .select('*, sender:profiles!sender_id(full_name)')
      .eq('listing_id', listingId)
      .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Marcar como lidas as mensagens recebidas por este user
    await supabase
      .from('listing_messages')
      .update({ is_read: true })
      .eq('listing_id', listingId)
      .eq('receiver_id', user.id)
      .eq('is_read', false)

    return NextResponse.json({ messages: messages || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST — envia mensagem
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { listing_id, receiver_id, message } = body

    if (!listing_id || !receiver_id || !message?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Sanitizar mensagem (ocultar telefones)
    const safeMessage = maskPhoneNumbers(message.trim())

    const { data, error } = await supabase.from('listing_messages').insert({
      listing_id,
      sender_id: user.id,
      receiver_id,
      message: safeMessage,
    }).select('*, sender:profiles!sender_id(full_name)').single()

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    // Disparar E-mail para o Destinatário
    try {
      const { data: receiverProfile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', receiver_id)
        .single()

      if (receiverProfile?.email) {
        const { sendEmailMessage } = await import('@kings/notifications/resend')
        
        await sendEmailMessage({
          to: receiverProfile.email,
          subject: 'Nova mensagem no Meu Simulador Usado!',
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <h2>Olá ${receiverProfile.full_name},</h2>
              <p>Você tem uma nova mensagem na plataforma <b>Meu Simulador Usado</b>.</p>
              <p><strong>${data.sender?.full_name || 'Alguém'}</strong> disse:</p>
              <blockquote style="background: #f4f4f5; padding: 12px; border-left: 4px solid #000; border-radius: 4px;">
                "${safeMessage}"
              </blockquote>
              <br/>
              <p><a href="https://meusimuladorusado.com.br/usado/account" style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Acessar Minha Garagem</a></p>
            </div>
          `
        })
      }
    } catch (emailErr) {
      console.error('Failed to send notification email:', emailErr)
    }

    return NextResponse.json({ message: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
