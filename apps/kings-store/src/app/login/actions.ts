'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createServerSupabaseClient()
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?error=Invalid credentials')
  }

  // Redirect to account dashboard
  redirect('/account')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('full_name') as string

  const supabase = await createServerSupabaseClient()

  // O Trigger do banco irá criar a role em `profiles`
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  })

  if (error) {
    return redirect('/login?error=Signup failed')
  }

  // Auto-login succeeds or sends email verification depending on Supabase settings.
  // For basic local dev it usually logs you right in.
  redirect('/account')
}

export async function logout() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/login')
}
