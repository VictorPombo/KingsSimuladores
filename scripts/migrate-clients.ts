import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Variáveis de ambiente faltando (SUPABASE_URL ou SERVICE_KEY).')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

async function main() {
  const fileContent = fs.readFileSync('scripts/clientes_2026-04-07.csv', 'utf-8')
  const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0)

  console.log(`\n📦 Iniciando migração de ${lines.length} clientes...`)

  let imported = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    const firstComma = line.indexOf(',')
    
    if (firstComma === -1) {
      skipped++
      continue
    }

    const email = line.substring(0, firstComma).trim().toLowerCase()
    const restOfLine = line.substring(firstComma + 1).trim()
    const name = restOfLine.split(',')[0].trim()

    if (!email.includes('@') || email.length < 5 || email.toLowerCase() === 'email') {
      skipped++
      continue
    }

    const randomPassword = Math.random().toString(36).substring(2, 10) + 
                           Math.random().toString(36).substring(2, 10) + 'X9@!'

    // Criar o usuário no Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: randomPassword,
      email_confirm: true,
      user_metadata: { 
        full_name: name,
        source: 'loja_integrada_migration' 
      }
    })

    if (authError) {
      if (authError.message.includes('already exists') || authError.status === 422) {
        skipped++ 
      } else {
        console.error(`❌ Erro criando usuário [${email}]: ${authError.message}`)
        errors++
      }
    } else if (authData?.user) {
      // Como vamos desativar o trigger, o script VAI CRIAR O PROFILE NATIVAMENTE!
      const { error: profileError } = await supabase.from('profiles').insert({
        auth_id: authData.user.id,
        email: email,
        full_name: name,
        role: 'client'
      })
      
      if (profileError) {
        // Ignora duplicidade caso o trigger ainda exista e tenha funcionado
        if (!profileError.message.includes('duplicate key')) {
          console.error(`⚠️ Erro inserindo profile [${email}]: ${profileError.message}`)
        }
      }
      imported++
    }

    if (i > 0 && i % 100 === 0) {
      console.log(`   ... processados ${i} de ${lines.length} (${imported} criados)`)
    }
    
    await new Promise(res => setTimeout(res, 60))
  }

  console.log('\n═══════════════════════════════════════════')
  console.log(`✅ Contas criadas: ${imported}`)
  console.log(`⏭️  Pulados (sem email ou já existem): ${skipped}`)
  console.log(`❌ Erros: ${errors}`)
  console.log(`📊 Total processado: ${lines.length}`)
  console.log('═══════════════════════════════════════════')
}

main()
