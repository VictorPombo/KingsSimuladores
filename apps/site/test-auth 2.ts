import { createServerSupabaseClient } from '@kings/db/server'

declare module '@supabase/supabase-js' {
  interface SupabaseAuthClient {
    getUser(): Promise<any>;
  }
}

async function run() {
    const supabase = await createServerSupabaseClient()
    supabase.auth.getUser()
}
