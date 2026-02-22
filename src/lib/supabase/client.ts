// Browser-side Supabase client — synchronous singleton.
// Uses @supabase/supabase-js directly (not @supabase/ssr) to avoid
// Next.js 16 Turbopack misresolving the conditional package exports.
//
// server.ts handles the server-side client (async, uses cookies()).

import { createClient as _createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!_client) {
    _client = _createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _client
}