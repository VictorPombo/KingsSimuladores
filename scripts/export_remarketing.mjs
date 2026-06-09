import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as fs from 'fs'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  console.log('Buscando perfis no Supabase...')
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, created_at')
    .not('email', 'ilike', 'qa-guest%')
    .not('full_name', 'ilike', 'QA Guest%')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Erro:', error)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('Nenhum cliente encontrado.')
    return
  }

  // Generate CSV
  let csv = 'Nome,Email,Telefone,Data Cadastro\n'
  profiles.forEach(p => {
    const nome = p.full_name ? `"${p.full_name.replace(/"/g, '""')}"` : 'Sem Nome'
    const email = p.email || '-'
    const phone = p.phone || '-'
    const date = p.created_at ? new Date(p.created_at).toLocaleDateString('pt-BR') : '-'
    csv += `${nome},${email},${phone},${date}\n`
  })

  fs.writeFileSync('remarketing.csv', csv)
  console.log(`Sucesso! remarketing.csv gerado com ${profiles.length} contatos.`)
}
run()
