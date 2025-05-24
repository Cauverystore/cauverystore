import { supabase } from './supabaseClient'

export const fetchProducts = async () => {
  const { data, error } = await supabase.from('products').select('*')

  if (error) {
    console.error('Error fetching products:', error)
    return []
  }

  return data
}
