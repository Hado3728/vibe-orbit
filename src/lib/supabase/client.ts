import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // This prevents the "void 0" error by ensuring the client only
  // initializes if both keys are present.
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables are missing! Using placeholders to prevent build crash.")
  }

  return createBrowserClient(
    supabaseUrl || 'https://placeholder-url.com',
    supabaseKey || 'placeholder-key'
  )
}
