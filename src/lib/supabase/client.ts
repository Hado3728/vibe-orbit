import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Log clearly so it shows up in Vercel Function logs
    console.error(
      '[Supabase] ❌ Missing env vars: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
      'Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add them.'
    )
    // Return a safe stub so the app boots — auth calls will fail gracefully
    // rather than crashing next start entirely
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'placeholder-anon-key'
    )
  }

  return createBrowserClient(url, key)
}