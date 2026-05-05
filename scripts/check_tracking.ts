import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: 'apps/site/.env.local' })
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

supabase.from('marketplace_orders').update({ tracking_code: '123' }).eq('id', '39712da4-7a25-4460-8adb-732a93fe74b0').then(r => console.log(r.error))
