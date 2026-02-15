import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // This will show up in your Vercel logs and browser console
    console.error("CRITICAL: Supabase keys missing at runtime!");
  }

  return createBrowserClient(
    url!, // Use '!' to catch the error if it's still missing
    key!
  )
}