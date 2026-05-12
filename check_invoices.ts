import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data: invoices, error: invErr } = await supabase.from('invoices').select('*')
  console.log('Invoices table:', invoices?.length)
  
  const { data: orders, error: ordErr } = await supabase.from('orders').select('id, status, erp_id').in('status', ['paid', 'shipped', 'delivered'])
  console.log('Paid/Shipped orders:', orders?.length)
  
  console.log('Invoices detail:', invoices)
}
main()
