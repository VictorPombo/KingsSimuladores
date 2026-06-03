import { createAdminClient } from '@kings/db/server'

async function run() {
  const adminSupabase = createAdminClient()
  
  // 1. Create a dummy user
  const email = 'test_reset_flow@kingssimuladores.com.br'
  const { data, error } = await adminSupabase.auth.admin.createUser({
    email,
    password: 'password123',
    email_confirm: true,
  })

  if (error) {
    console.error('Failed to create user:', error)
    return
  }

  console.log('Created user:', data.user.id)

  // 2. Try to generate recovery link
  const { data: linkData, error: linkError } = await adminSupabase.auth.admin.generateLink({
    type: 'recovery',
    email,
  })

  if (linkError) {
    console.error('Failed to generate link:', linkError)
  } else {
    console.log('Recovery link:', linkData.properties.action_link)
  }

  // 3. Try to send via Resend using the exact same code
  const htmlBody = `<h1>Teste</h1><p>${linkData?.properties?.action_link}</p>`
  const resendApiKey = process.env.RESEND_API_KEY
  const resendFrom = process.env.RESEND_FROM_KINGS || 'onboarding@resend.dev'

  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + resendApiKey
    },
    body: JSON.stringify({
      from: resendFrom,
      to: [email],
      subject: 'Redefinição de Senha - Kings Simuladores',
      html: htmlBody
    })
  })

  const resendData = await resendRes.json()
  console.log('Resend response:', resendRes.status, resendData)

  // Cleanup
  await adminSupabase.auth.admin.deleteUser(data.user.id)
  console.log('Deleted user.')
}

run()
