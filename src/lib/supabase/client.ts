// Browser-side Supabase client — synchronous singleton.
// Uses @supabase/supabase-js directly (not @supabase/ssr) to avoid
// Next.js 16 Turbopack misresolving the conditional package exports.
//
// server.ts handles the server-side client (async, uses cookies()).

import { createClient as _createSupabaseClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'

// Robust Cookie Storage Adapter to bypass Turbopack export drops
// This ensures that the raw browser client mirrors @supabase/ssr behavior
// allowing Edge Middleware to intercept session cookies perfectly.
export const cookieStorage = {
    getItem(key: string): string | null {
        if (typeof document === "undefined") return null;
        const match = document.cookie.split("; ").find((row) => row.startsWith(`${key}=`));
        return match ? decodeURIComponent(match.split("=")[1]) : null;
    },
    setItem(key: string, value: string): void {
        // 1 Year persistent cookie so users don't have to log in constantly
        document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax; Secure`;
    },
    removeItem(key: string): void {
        document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax; Secure`;
    },
};

let _client: SupabaseClient | null = null

export function createClient(): SupabaseClient {
  if (!_client) {
    _client = _createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
            flowType: "pkce",
            storage: cookieStorage,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            persistSession: true
        }
      }
    )
  }
  return _client
}