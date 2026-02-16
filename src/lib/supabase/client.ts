import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Try to get keys from multiple possible locations
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_SUPABASE_URL : '');
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || (typeof window !== 'undefined' ? (window as any).NEXT_PUBLIC_SUPABASE_ANON_KEY : '');

  if (!url || !key) {
    console.warn("Keys missing. Site might crash.");
    // Dummy return to stop the (void 0) crash
    return { auth: { onAuthStateChange: () => { } } } as any;
  }

  return createBrowserClient(url, key)
}