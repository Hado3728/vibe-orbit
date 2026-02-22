import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return a typed stub — prevents (void 0) crashes when env vars are missing.
    // Auth calls will fail gracefully rather than crashing the whole page.
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithOtp: async () => ({ data: null, error: { message: 'Supabase not configured. Check env vars.' } }),
        signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase not configured. Check env vars.' } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ data: null, error: { message: 'Supabase not configured.' } }),
        insert: () => ({ data: null, error: { message: 'Supabase not configured.' } }),
        update: () => ({ data: null, error: { message: 'Supabase not configured.' } }),
        delete: () => ({ data: null, error: { message: 'Supabase not configured.' } }),
        eq: function () { return this },
        neq: function () { return this },
        single: function () { return { data: null, error: { message: 'Supabase not configured.' } } },
        limit: function () { return this },
      }),
    } as any
  }

  return createBrowserClient(url, key)
}