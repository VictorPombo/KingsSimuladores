import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado.' }, { status: 400 })
    }

    // Validate mime type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Tipo de arquivo não suportado: ${file.type}` }, { status: 415 })
    }

    const supabase = createAdminClient()

    const ext = file.name.split('.').pop()?.toLowerCase() || 'webp'
    const fileName = `catalog/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: uploadErr } = await supabase.storage
      .from('produtos')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (uploadErr) {
      console.error('[Upload] Erro no storage:', uploadErr)
      return NextResponse.json({ error: uploadErr.message }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage.from('produtos').getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl })
  } catch (err: any) {
    console.error('[Upload] Erro inesperado:', err)
    return NextResponse.json({ error: err.message || 'Erro interno.' }, { status: 500 })
  }
}
