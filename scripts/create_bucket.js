require('dotenv').config({ path: 'apps/site/.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function run() {
  const { data, error } = await supabase.storage.createBucket('produtos', { public: true })
  if (error) {
    if (error.message.includes('already exists')) {
      console.log('Bucket "produtos" já existe. Atualizando para público...')
      await supabase.storage.updateBucket('produtos', { public: true })
    } else {
      console.error('Erro ao criar bucket:', error)
    }
  } else {
    console.log('Bucket "produtos" criado com sucesso!', data)
  }
}
run()
