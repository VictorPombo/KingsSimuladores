require('dotenv').config({ path: 'apps/site/.env.local' })

async function run() {
  const apiKey = process.env.GEMINI_API_KEY
  // Simulate large payload
  const largeText = "Specs: " + "weight 5kg ".repeat(5000)
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: largeText }] }] })
  })
  const text = await res.text()
  console.log('Status:', res.status)
  console.log('Body:', text.substring(0, 100) + '...')
}
run()
