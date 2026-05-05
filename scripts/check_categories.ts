import { createAdminClient } from './apps/site/src/app/(admin)/utils/supabase-admin'
import * as dotenv from 'dotenv'
dotenv.config({ path: './apps/site/.env.local' })

async function run() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  const { createClient } = require('@supabase/supabase-js')
  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: categories, error: catError } = await supabase.from('categories').select('*')
  if (catError) console.error(catError)
  
  const { data: products, error: prodError } = await supabase.from('products').select('category_id')
  
  const usageCount = {}
  products?.forEach(p => {
    if (p.category_id) {
      usageCount[p.category_id] = (usageCount[p.category_id] || 0) + 1
    }
  })

  categories?.sort((a, b) => a.name.localeCompare(b.name)).forEach(c => {
    console.log(`- ${c.name} (Scope: ${c.brand_scope}) | ID: ${c.id} | Utilizado por: ${usageCount[c.id] || 0} produtos`)
  })
}
run()
