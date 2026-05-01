import { createServerSupabaseClient } from '@kings/db/server'

/**
 * Downloads external images and uploads them to Supabase Storage.
 * Returns an array of URLs (mix of existing Supabase URLs and newly uploaded ones).
 */
export async function processExternalImages(images: string[]): Promise<string[]> {
  if (!images || images.length === 0) return []
  
  const supabase = await createServerSupabaseClient()
  
  const processedUrls = await Promise.all(images.map(async (url) => {
    // Se a imagem já é do nosso Supabase, apenas retorna a URL
    if (url.includes('supabase.co')) {
      return url
    }

    try {
      console.log(`[ImageUtils] Baixando imagem externa: ${url}`)
      const res = await fetch(url)
      
      if (!res.ok) {
        console.warn(`[ImageUtils] Falha ao baixar ${url} (Status: ${res.status}). Ignorando imagem.`)
        return null
      }

      const buffer = await res.arrayBuffer()
      const contentType = res.headers.get('content-type') || 'image/jpeg'
      
      // Gerar um nome único
      const ext = contentType.split('/')[1] || 'jpg'
      const fileName = `catalog/ext-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`

      const { data, error } = await supabase.storage
        .from('produtos')
        .upload(fileName, buffer, {
          contentType,
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error(`[ImageUtils] Erro no upload da imagem ${url} para o Supabase:`, error)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('produtos')
        .getPublicUrl(fileName)
        
      console.log(`[ImageUtils] Imagem migrada com sucesso: ${publicUrl}`)
      return publicUrl
    } catch (err) {
      console.error(`[ImageUtils] Exceção ao processar imagem ${url}:`, err)
      return null
    }
  }))

  return processedUrls.filter((url): url is string => url !== null)
}
