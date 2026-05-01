'use server'

import { createServerSupabaseClient } from '@kings/db/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const fullName = formData.get('full_name') as string
  const cpfCnpj = formData.get('cpf_cnpj') as string
  const phone = formData.get('phone') as string

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      cpf_cnpj: cpfCnpj,
      phone: phone,
      updated_at: new Date().toISOString()
    })
    .eq('auth_id', user.id)

  if (error) {
    console.error('Erro ao atualizar perfil:', error)
    return { error: 'Erro ao atualizar os dados pessoais.' }
  }

  revalidatePath('/account')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createServerSupabaseClient()
  
  const newPassword = formData.get('new_password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (newPassword !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  if (newPassword.length < 6) {
    return { error: 'A senha deve ter no mínimo 6 caracteres.' }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    console.error('Erro ao atualizar senha:', error)
    return { error: 'Não foi possível atualizar a senha.' }
  }

  revalidatePath('/account')
  return { success: true }
}

export async function addAddress(addressData: any) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Usuário não autenticado.' }

  // Buscar endereços atuais
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('addresses')
    .eq('auth_id', user.id)
    .single()

  if (profileError) return { error: 'Erro ao buscar perfil.' }

  const currentAddresses = Array.isArray(profile.addresses) ? profile.addresses : []
  
  // Se for definido como principal, desmarca os outros
  if (addressData.is_default) {
    currentAddresses.forEach((addr: any) => addr.is_default = false)
  }

  const newAddress = {
    id: crypto.randomUUID(),
    ...addressData,
    created_at: new Date().toISOString()
  }

  const updatedAddresses = [...currentAddresses, newAddress]

  const { error } = await supabase
    .from('profiles')
    .update({ addresses: updatedAddresses })
    .eq('auth_id', user.id)

  if (error) return { error: 'Erro ao salvar o endereço.' }

  revalidatePath('/account')
  return { success: true }
}

export async function removeAddress(addressId: string) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Usuário não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('addresses')
    .eq('auth_id', user.id)
    .single()

  if (!profile || !Array.isArray(profile.addresses)) return { error: 'Endereços não encontrados.' }

  const updatedAddresses = profile.addresses.filter((addr: any) => addr.id !== addressId)

  const { error } = await supabase
    .from('profiles')
    .update({ addresses: updatedAddresses })
    .eq('auth_id', user.id)

  if (error) return { error: 'Erro ao remover endereço.' }

  revalidatePath('/account')
  return { success: true }
}
