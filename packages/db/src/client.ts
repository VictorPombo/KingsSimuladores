/**
 * @kings/db — Supabase Browser Client
 *
 * Para uso em Client Components (hooks, event handlers).
 * Usa a anon key (segura para o frontend).
 */
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
