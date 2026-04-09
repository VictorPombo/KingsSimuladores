import { createServerSupabaseClient } from '@kings/db'

export async function applySegmentedPrices(products: any[]) {
  if (!products || products.length === 0) return products

  try {
    const supabase = await createServerSupabaseClient()
    
    // 1. Check logged in user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('SegmentedPrices: No user logged in.')
      return products
    }

    // 2. Get user profile to check customer_group_id
    const { data: profile } = await supabase
      .from('profiles')
      .select('customer_group_id')
      .eq('id', user.id)
      .single()

    if (!profile?.customer_group_id) {
      console.log('SegmentedPrices: User', user.id, 'has no customer_group_id.')
      return products
    }

    // 3. Get customer group configuration
    const { data: group } = await supabase
      .from('customer_groups')
      .select('discount_percent, apply_to_all_products')
      .eq('id', profile.customer_group_id)
      .single()

    if (!group) return products

    // 4. Get specific overrides for this group
    const productIds = products.map((p: any) => p.id)
    const { data: overrides } = await supabase
      .from('segmented_prices')
      .select('product_id, price, status')
      .eq('group_id', profile.customer_group_id)
      .in('product_id', productIds)

    const overrideMap = {} as Record<string, { price: number | null, status: string }>
    if (overrides) {
      overrides.forEach(o => overrideMap[o.product_id] = o)
    }

    console.log('SegmentedPrices: Processing for Group', group.name || profile.customer_group_id, '| Overrides found:', overrides?.length)

    // 5. Compute prices
    return products.map((p: any) => {
      const pCopy = { ...p }
      const override = overrideMap[p.id]
      const discountMultiplier = 1 - (Number(group.discount_percent) / 100)
      
      let calculatedPrice = Number(p.price) 

      if (group.apply_to_all_products) {
        // Mode: Site Todo
        if (override) {
           if (override.status === 'ignored') {
             calculatedPrice = Number(p.price) // Normal
           } else if (override.price !== null) {
             calculatedPrice = Number(override.price) // Fixed
           } else {
             calculatedPrice = Number(p.price) * discountMultiplier // Exact Discount
           }
        } else {
           calculatedPrice = Number(p.price) * discountMultiplier // Default inherited
        }
      } else {
        // Mode: Produtos Selecionados
        if (override && override.status === 'active') {
           if (override.price !== null) {
             calculatedPrice = Number(override.price) // Fixed
           } else {
             calculatedPrice = Number(p.price) * discountMultiplier // Base discount
           }
        } else {
           calculatedPrice = Number(p.price) // Default inherited normal
        }
      }

      // If price decreased, keep the original as `price_compare` so UI shows slash discount
      if (calculatedPrice < Number(p.price)) {
        if (!pCopy.price_compare || pCopy.price_compare <= p.price) {
          pCopy.price_compare = p.price
        }
      }
      
      pCopy.price = calculatedPrice
      return pCopy
    })

  } catch (error) {
    console.error('Error applying segmented prices', error)
    return products
  }
}
