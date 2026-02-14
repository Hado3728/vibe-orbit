import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase environment variables are missing!")
    // Return a dummy client or throw a clearer error
    throw new Error("Missing Supabase environment variables")
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseKey
  )
}
