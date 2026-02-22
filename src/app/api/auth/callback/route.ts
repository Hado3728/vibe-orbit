import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/**
 * OAuth PKCE callback handler.
 *
 * Supabase sends the user back here after Google authenticates them, with a
 * one-time `code` param in the query string (PKCE flow — NOT a hash fragment).
 *
 * This route:
 *   1. Reads the ?code from the URL
 *   2. Exchanges it for a full session via Supabase (sets secure HttpOnly cookies)
 *   3. Redirects the user to /dashboard
 *
 * If there is no code (direct navigation, stale link, etc.) we redirect to
 * /login with an error hint.
 *
 * Folder: src/app/api/auth/callback/route.ts
 */
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // 'next' lets deep-link aware flows redirect to a specific page post-login
    const next = searchParams.get('next') ?? '/dashboard'

    if (!code) {
        // No code — either a stale link or direct hit. Send them to login.
        return NextResponse.redirect(`${origin}/login?error=missing_code`)
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // In Route Handlers we can always set cookies,
                        // but the try/catch mirrors server.ts for consistency.
                    }
                },
            },
        }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error('[auth/callback] exchangeCodeForSession error:', error.message)
        return NextResponse.redirect(`${origin}/login?error=auth_exchange_failed`)
    }

    // Session established — redirect into the app
    return NextResponse.redirect(`${origin}${next}`)
}
