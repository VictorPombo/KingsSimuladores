import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import { sendWhatsappMessage } from '@kings/notifications'

export async function POST(req: Request) {
  try {
    const { orderId, newStatus, sendWhatsapp, customMessage, phone, customerName } = await req.json()

    if (!orderId || !newStatus) {
      return NextResponse.json({ error: 'orderId e newStatus são obrigatórios' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Enviar WhatsApp se solicitado
    if (sendWhatsapp && phone && customMessage) {
      const cleanPhone = phone.replace(/\D/g, '')
      await sendWhatsappMessage({
        phone: cleanPhone,
        message: customMessage,
      }).catch((err: any) => {
        console.error('[update-status] Erro ao enviar WhatsApp:', err)
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('[update-status] Erro:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
