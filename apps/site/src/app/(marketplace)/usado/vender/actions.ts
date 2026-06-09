'use server'

import { createServerSupabaseClient } from '@kings/db'
import { createClient } from '@supabase/supabase-js'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

export async function uploadMarketplaceImage(formData: FormData) {
  // 1. Verificar sessão do usuário no servidor (nunca confiar no cliente)
  const supabase = await createServerSupabaseClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Não autorizado. Faça login para continuar.')
  }

  const file = formData.get('file') as File
  const fileName = formData.get('fileName') as string

  // 2. Validar presença dos dados
  if (!file || !fileName) {
    throw new Error('Arquivo ou nome do arquivo ausente.')
  }

  // 3. Validar tipo MIME no servidor (nunca confiar no content-type do cliente)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error(`Tipo de arquivo não permitido: ${file.type}. Use JPG, PNG, WEBP ou GIF.`)
  }

  // 4. Validar tamanho do arquivo
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error(`Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)}MB). Máximo: 5MB.`)
  }

  // 5. Forçar que o caminho do arquivo começa com o ID do usuário autenticado
  // Previne Directory Traversal: um usuário não pode sobrescrever imagens de outro
  const safePath = `${user.id}/${fileName.replace(/\.\./g, '').replace(/^\//, '')}`

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 6. Garante que o bucket existe
  await adminSupabase.storage.createBucket('msu-listings', { public: true }).catch(() => {})

  const arrayBuffer = await file.arrayBuffer()

  const { error } = await adminSupabase.storage
    .from('msu-listings')
    .upload(safePath, arrayBuffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    })

  if (error) {
    console.error('[uploadMarketplaceImage] Upload error:', error)
    throw new Error(`Falha no upload: ${error.message}`)
  }

  const { data: publicUrlData } = adminSupabase.storage.from('msu-listings').getPublicUrl(safePath)
  return publicUrlData.publicUrl
}
