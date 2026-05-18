// Script para encontrar produtos com imagens quebradas e setar como draft
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://mlrcaugthlkscusyxqrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scmNhdWd0aGxrc2N1c3l4cXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0Nzk3NywiZXhwIjoyMDkwODIzOTc3fQ.3vPHOQRZj0jMdtFIqYUtehxlNnrOQoHdTdTgcdbAfeE'
)

async function checkImages() {
  const { data: products, error } = await supabase
    .from('products')
    .select('id, title, images, status')
    .eq('status', 'active')

  if (error) { console.error(error); return }

  console.log(`Total produtos ativos: ${products.length}\n`)

  const broken = []

  for (const p of products) {
    const imgs = p.images || []
    
    // Sem imagem nenhuma
    if (imgs.length === 0) {
      broken.push({ id: p.id, title: p.title, reason: 'SEM IMAGEM' })
      continue
    }

    // Checa a primeira imagem
    const firstImg = imgs[0]
    if (!firstImg || typeof firstImg !== 'string' || firstImg.trim() === '') {
      broken.push({ id: p.id, title: p.title, reason: 'URL VAZIA' })
      continue
    }

    // Testa se a URL responde com 200
    try {
      const res = await fetch(firstImg, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
      if (!res.ok) {
        broken.push({ id: p.id, title: p.title, reason: `HTTP ${res.status}`, url: firstImg })
      }
    } catch (e) {
      broken.push({ id: p.id, title: p.title, reason: `TIMEOUT/ERRO: ${e.message}`, url: firstImg })
    }
  }

  console.log(`\n=== PRODUTOS COM IMAGEM QUEBRADA: ${broken.length} ===\n`)
  broken.forEach(b => {
    console.log(`  ❌ ${b.title}`)
    console.log(`     Motivo: ${b.reason}`)
    if (b.url) console.log(`     URL: ${b.url}`)
    console.log()
  })

  if (broken.length > 0) {
    console.log(`\nIDs para setar como draft:`)
    console.log(broken.map(b => b.id))
  }
}

checkImages()
