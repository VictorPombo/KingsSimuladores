require('dotenv').config({ path: 'apps/site/.env.local' })

async function run() {
  const apiKey = process.env.GEMINI_API_KEY
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: "hello" }] }] })
  })
  const text = await res.text()
  console.log('Status:', res.status)
  console.log('Body:', text.substring(0, 100) + '...')
}
run()
