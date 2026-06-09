import { NextResponse } from 'next/server'
import { createAdminClient } from '@kings/db'

export const dynamic = 'force-dynamic'

const ALERT_THRESHOLD = 5
const PENDING_WINDOW_MINUTES = 30

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const windowCutoff = new Date(Date.now() - PENDING_WINDOW_MINUTES * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('orders')
    .select('created_at')
    .eq('status', 'pending')
    .not('preference_id', 'is', null)
    .lt('created_at', windowCutoff)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'DB error' }, { status: 500 })
  }

  const pending_count = data?.length ?? 0
  const oldest = data?.[0]?.created_at
  const oldest_pending_minutes = oldest
    ? Math.floor((Date.now() - new Date(oldest).getTime()) / 60_000)
    : 0

  const isAlert = pending_count >= ALERT_THRESHOLD

  return NextResponse.json(
    { status: isAlert ? 'alert' : 'ok', pending_count, oldest_pending_minutes },
    { status: isAlert ? 503 : 200 }
  )
}
