import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    console.error("Supabase keys are missing! Check Vercel Dashboard.")
    // Returning a dummy object prevents the '(void 0) is not a function' crash
    return { auth: { onAuthStateChange: () => { } } } as any
  }

  return createBrowserClient(url, key)
}