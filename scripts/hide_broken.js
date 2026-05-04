// Script para ocultar produto com imagem quebrada
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://mlrcaugthlkscusyxqrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1scmNhdWd0aGxrc2N1c3l4cXJmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTI0Nzk3NywiZXhwIjoyMDkwODIzOTc3fQ.3vPHOQRZj0jMdtFIqYUtehxlNnrOQoHdTdTgcdbAfeE'
)

async function hideBroken() {
  const idsToHide = [ '241a633d-6352-49c7-98ce-1a6cc6003329' ]

  const { data, error } = await supabase
    .from('products')
    .update({ status: 'draft' })
    .in('id', idsToHide)
    .select('title')

  if (error) {
    console.error('Erro ao atualizar:', error)
  } else {
    console.log('Produtos arquivados/ocultados com sucesso:', data)
  }
}

hideBroken()
