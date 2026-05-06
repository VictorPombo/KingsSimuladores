import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db/server'

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ exists: false }, { status: 400 })

    const supabase = createAdminClient()
    
    // Use admin client to bypass RLS and check if email exists
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email.trim())
      .maybeSingle()
    
    if (error) {
      console.error("[Check Email API] Error:", error.message)
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({ exists: !!data })
  } catch (err: any) {
    console.error("[Check Email API] Exception:", err.message)
    return NextResponse.json({ exists: false }, { status: 500 })
  }
}
