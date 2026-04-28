import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { title, message, priority, sendWhatsapp } = await req.json()
    const supabase = await createServerSupabaseClient()

    // 1. Verificar permissão de admin (básico)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // 2. Salvar notificação no banco para o sistema (se existir a tabela notifications)
    // Usaremos try catch para não falhar caso a tabela não exista ainda.
    try {
      await supabase.from('notifications').insert({ title, message, priority })
    } catch (e) {
      console.log('Tabela notifications não encontrada ou erro ao inserir.', e)
    }

    let whatsappSent = 0

    // 3. Se for pra enviar WhatsApp, busca os perfis que tem telefone
    if (sendWhatsapp) {
      const { data: users } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .not('phone', 'is', null)

      if (users && users.length > 0) {
        const apiUrl = process.env.WHATSAPP_API_URL
        const apiKey = process.env.WHATSAPP_API_KEY

        const formattedMessage = `*${title}*\n\n${message}\n\n_Meu Simulador Usado_`

        for (const user of users) {
          const cleanPhone = user.phone.replace(/\D/g, '')
          // Só envia se parecer um celular brasileiro válido e a API estiver configurada
          if (cleanPhone.length >= 10 && apiUrl && apiKey) {
            try {
              await fetch(`${apiUrl}/message/sendText`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': apiKey
                },
                body: JSON.stringify({
                  number: `55${cleanPhone}`,
                  text: formattedMessage
                })
              })
              whatsappSent++
            } catch (err) {
              console.error(`Erro ao enviar WA para ${cleanPhone}`, err)
            }
          }
        }
      }
    }

    return NextResponse.json({ success: true, whatsappSent })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
