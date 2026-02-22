import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Disable caching so every auth callback is handled fresh
export const dynamic = 'force-dynamic';

const PRODUCTION_URL = 'https://vibe-orbit-production.up.railway.app';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        console.error('[auth/callback] No code param found in URL');
        return NextResponse.redirect(`${PRODUCTION_URL}/login?error=auth_failed`);
    }

    // Build the success redirect response FIRST so we can attach session
    // cookies directly to it. cookieStore.set() writes to the *request*
    // cookie jar, which is invisible to NextResponse.redirect() — that's
    // what was causing the 500. response.cookies.set() writes to the
    // *response* headers, which is what the browser actually receives.
    const response = NextResponse.redirect(`${PRODUCTION_URL}/dashboard`);
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    // Write session cookies onto the redirect response
                    response.cookies.set({ name, value, ...options });
                },
                remove(name: string, options: CookieOptions) {
                    response.cookies.set({ name, value: '', ...options });
                },
            },
        }
    );

    try {
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error('SUPABASE OAUTH ERROR:', error.message);
            return NextResponse.redirect(`${PRODUCTION_URL}/login?error=auth_failed`);
        }

        // Session cookies are already on `response` via the set() calls above
        return response;
    } catch (err) {
        console.error('SUPABASE CALLBACK CRASH:', err);
        return NextResponse.redirect(`${PRODUCTION_URL}/login?error=auth_failed`);
    }
}
