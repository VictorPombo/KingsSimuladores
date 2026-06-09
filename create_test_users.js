const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mlrcaugthlkscusyxqrf.supabase.co"
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scmNhdWd0aGxrc2N1c3l4cXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0Nzk3NywiZXhwIjoyMDkwODIzOTc3fQ.3vPHOQRZj0jMdtFIqYUtehxlNnrOQoHdTdTgcdbAfeE"

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function run() {
  console.log("Criando usuário VENDEDOR...")
  const seller = await supabase.auth.admin.createUser({
    email: 'vendedor@kings.com.br',
    password: 'kings123password',
    email_confirm: true,
    user_metadata: { full_name: 'Piloto Vendedor' }
  })
  if (seller.error && seller.error.status !== 422) console.error("Erro Vendedor:", seller.error)
  else console.log("Vendedor criado com sucesso.")

  console.log("Criando usuário COMPRADOR...")
  const buyer = await supabase.auth.admin.createUser({
    email: 'comprador@kings.com.br',
    password: 'kings123password',
    email_confirm: true,
    user_metadata: { full_name: 'Piloto Comprador' }
  })
  if (buyer.error && buyer.error.status !== 422) console.error("Erro Comprador:", buyer.error)
  else console.log("Comprador criado com sucesso.")
}

run()
