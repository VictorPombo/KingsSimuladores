'use server'

import { createClient } from '@supabase/supabase-js'

export async function uploadMarketplaceImage(formData: FormData) {
  const file = formData.get('file') as File
  const fileName = formData.get('fileName') as string
  
  if (!file || !fileName) {
    throw new Error('Arquivo ou nome do arquivo ausente.')
  }
  
  // Usamos a SERVICE_ROLE_KEY para contornar problemas de RLS (Row-Level Security)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  // Garante que o bucket existe (se já existir, vai apenas ignorar silenciosamente)
  await supabase.storage.createBucket('marketplace-listings', { public: true }).catch(() => {})
  
  const arrayBuffer = await file.arrayBuffer()
  
  const { data, error } = await supabase.storage
    .from('marketplace-listings')
    .upload(fileName, arrayBuffer, {
      contentType: file.type,
      cacheControl: '3600',
      upsert: false
    })
    
  if (error) {
    console.error('Erro de upload no servidor:', error)
    throw new Error(error.message)
  }
  
  const { data: publicUrlData } = supabase.storage.from('marketplace-listings').getPublicUrl(fileName)
  return publicUrlData.publicUrl
}
