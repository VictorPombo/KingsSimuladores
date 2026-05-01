import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

// Filtra contatos (telefone, email, redes sociais) de forma EXTREMA (padrão grandes plataformas)
function sanitizeMessage(text: string): string {
  let safeText = text;
  
  // Normalização para facilitar regex (remover acentos)
  const normalizedText = safeText.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // 1. Ocultar Telefones absurdamente disfarçados (ex: 1 1 9 9 9 9 9, 1a1a9, 11-999-999)
  // Pega qualquer sequência que tenha entre 8 e 13 dígitos numéricos na string.
  safeText = safeText.replace(/(?:(?:00|\+)?(?:55))?(?:[\W_A-Za-z]*\d){8,13}/g, ' [NÚMERO OCULTO] ');
  
  // 2. Ocultar Emails extremamente disfarçados (joao at gmail dot com, joao(arroba)hotmail)
  safeText = safeText.replace(/[a-zA-Z0-9._%+-]+(?:\s*@\s*|\s*\(?arroba\)?\s*|\s*\[?at\]?\s*|\s+em\s+)[a-zA-Z0-9.-]+(?:\.\s*|\s+ponto\s+|dot\s+)[a-zA-Z]{2,}/gi, ' [EMAIL OCULTO] ');
  safeText = safeText.replace(/\b(gmail|hotmail|outlook|yahoo|icloud|protonmail)(?:\.\s*com|\s+com|\s+ponto\s+com)?\b/gi, '[PROVEDOR OCULTO]');
  
  // 3. Ocultar Arrobas e Links diretos de redes sociais
  safeText = safeText.replace(/@\s*([a-zA-Z0-9_.-]+)/g, ' [REDE SOCIAL OCULTA] ');
  safeText = safeText.replace(/(?:https?:\/\/|www\.)?[a-zA-Z0-9-]+\.(?:com|br|net|org|io|me)(?:\/[^\s]*)?/gi, ' [LINK OCULTO] ');
  
  // 4. Ocultar tentativas comuns de burlar (redes e apps)
  safeText = safeText.replace(/\b(zap|zapp|z4p|wpp|whats|whatsapp|watsap|insta|instg|instagram|inst@|ig|facebook|face|telegram|discord|dc|tt|twitter|tiktok|ttk)\b/gi, '[BLOQUEADO]');

  // 5. Convites e Evasão Contextual (Ação + Fora da plataforma)
  safeText = safeText.replace(/\b(me chama|chama no|chama la|chama ai|add no|me add|adiciona|passa o|meu contato|manda (?:fotos|video) no|chama no|meu num|te mando no|olha o)\b/gi, '[TENTATIVA DE EVASÃO]');

  // 6. Bloquear números escritos por extenso de forma disfarçada (ex: z e r o, d-o-1-s, 0it0)
  const numberWordsRegex = /\b(z[e3]r[o0]|um|d[o0]i[s5z]|tr[e3]s|quatr[o0]|cinc[o0]|s[e3]i[s5z]|s[e3]t[e3]|oit[o0]|0it[o0]|n[o0]v[e3]|d[e3]z|onz[e3]|d[o0]z[e3]|tr[e3]z[e3]|c[e3]m|mil)\b/gi;
  
  const matches = safeText.match(numberWordsRegex);
  // Mais de 1 número escrito bloqueia (fecha o cerco contra telefones soletrados)
  if (matches && matches.length > 1) {
    safeText = safeText.replace(numberWordsRegex, '[EXTENSO OCULTO]');
  }

  // 7. Detecção de soletragem isolada (w a t s)
  safeText = safeText.replace(/\b([a-zA-Z])(?:[\s.-]+\1)+\b/gi, '[CARACTERES REPETIDOS]');

  return safeText
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

    const { createAdminClient } = await import('@kings/db/server')
    const adminSupabase = createAdminClient()

    // IMPORTANTE: precisamos usar o profile.id porque contas antigas têm profile.id diferente do auth.users.id
    const { data: profile } = await adminSupabase.from('profiles').select('id').eq('auth_id', user.id).single()
    const profileId = profile?.id || user.id

    const { data: messages, error } = await adminSupabase
      .from('listing_messages')
      .select('*, sender:profiles!sender_id(full_name)')
      .eq('listing_id', listingId)
      .or(`sender_id.eq.${profileId},receiver_id.eq.${profileId}`)
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

    // Sanitizar mensagem (ocultar contatos)
    const safeMessage = sanitizeMessage(message.trim())

    // Usa Admin Client para forçar a inserção no banco ignorando RLS
    // (a segurança já foi garantida pelo supabase.auth.getUser acima)
    const { createAdminClient } = await import('@kings/db/server')
    const adminSupabase = createAdminClient()

    // IMPORTANTE: precisamos usar o profile.id como sender_id, e não o auth_id.
    const { data: profile } = await adminSupabase.from('profiles').select('id').eq('auth_id', user.id).single()
    const profileId = profile?.id || user.id

    const { data, error } = await adminSupabase.from('listing_messages').insert({
      listing_id,
      sender_id: profileId,
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
        const { sendEmailMessage } = await import('@kings/notifications')
        
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
