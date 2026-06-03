import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Fetch count of dead jobs
    const { count, error } = await supabase
      .from('order_jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'dead')

    if (error) throw error

    return NextResponse.json({ count: count || 0 })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao buscar dead jobs', count: 0 }, { status: 500 })
  }
}

export async function POST() {
  // Retry all dead jobs
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('order_jobs')
      .update({ status: 'pending', retry_count: 0 })
      .eq('status', 'dead')

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erro ao resetar dead jobs' }, { status: 500 })
  }
}
