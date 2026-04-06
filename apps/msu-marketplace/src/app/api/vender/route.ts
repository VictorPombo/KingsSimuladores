import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'
import crypto from 'crypto'

// Static mock seller ID — must match the profile seeded in Supabase
const MOCK_SELLER_ID = 'ae8f8bc9-dc8f-470d-b6f1-839a51d679a9'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const supabase = createAdminClient()

    const { error } = await (supabase.from('marketplace_listings') as any).insert({
      id: crypto.randomUUID(),
      title: body.title,
      price: body.price,
      condition: body.condition,
      images: [body.imageUrl],
      description: body.description,
      status: 'pending_review',
      seller_id: MOCK_SELLER_ID,
      commission_rate: 0.1,
    })

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
