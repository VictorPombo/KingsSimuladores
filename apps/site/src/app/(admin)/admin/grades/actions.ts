'use server'

import { createAdminClient } from '@kings/db'
import { revalidatePath } from 'next/cache'

export async function createGridAction(payload: { name: string; options: string[] }) {
  try {
    const supabase = createAdminClient()
    
    // Converte opções para lower/capitalize ou mantém raw
    const optionsNorm = payload.options.map(o => o.trim()).filter(Boolean)

    if (!payload.name || optionsNorm.length === 0) {
      return { success: false, error: 'Nome e pelo menos uma opção são obrigatórios' }
    }

    const { error } = await supabase
      .from('variation_grids')
      .insert({
        name: payload.name,
        options: optionsNorm
      })

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Já existe uma grade com esse nome.' }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/grades')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function updateGridAction(id: string, payload: { name: string; options: string[] }) {
  try {
    const supabase = createAdminClient()
    
    const optionsNorm = payload.options.map(o => o.trim()).filter(Boolean)

    if (!payload.name || optionsNorm.length === 0) {
      return { success: false, error: 'Nome e pelo menos uma opção são obrigatórios' }
    }

    const { error } = await supabase
      .from('variation_grids')
      .update({
        name: payload.name,
        options: optionsNorm
      })
      .eq('id', id)

    if (error) {
      if (error.code === '23505') return { success: false, error: 'Já existe uma grade com esse nome.' }
      return { success: false, error: error.message }
    }

    revalidatePath('/admin/grades')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

export async function deleteGridAction(id: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('variation_grids').delete().eq('id', id)
    if (error) throw error

    revalidatePath('/admin/grades')
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
