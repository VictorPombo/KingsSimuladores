import { createServerSupabaseClient } from '@kings/db'
import { WaitlistClient } from './WaitlistClient'

export const revalidate = 0

export default async function WaitlistPage() {
  const supabase = await createServerSupabaseClient()

  // Buscar produtos que têm pelo menos 1 item na waitlist
  // e fazer um join com waitlist
  const { data: waitlistData, error } = await supabase
    .from('waitlist')
    .select(`
      id,
      product_id,
      customer_name,
      customer_phone,
      status,
      created_at,
      notified_at,
      product:product_id (
        title,
        images
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Waitlist Error:', error)
  }

  return <WaitlistClient data={waitlistData || []} />
}
