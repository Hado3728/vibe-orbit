import { createBrowserClient } from '@supabase/ssr'

// We assign these to constants OUTSIDE the function 
// This forces Next.js to "bake" the values into the JS file during build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase Environment Variables")
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}