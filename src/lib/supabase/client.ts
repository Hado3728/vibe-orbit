import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // This allows the page to load without crashing immediately
    // so you can see the diagnostic logs
    console.error("Environment variables are MISSING at runtime");
    return null as any;
  }

  return createBrowserClient(url, key)
}