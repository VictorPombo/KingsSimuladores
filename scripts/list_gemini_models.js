require('dotenv').config({ path: 'apps/site/.env.local' })

async function run() {
  const apiKey = process.env.GEMINI_API_KEY
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
  const data = await res.json()
  if (data.models) {
    const models = data.models.map(m => m.name).filter(n => n.includes('gemini'))
    console.log('Available Gemini Models:', models.join(', '))
  } else {
    console.log('Error:', data)
  }
}
run()
