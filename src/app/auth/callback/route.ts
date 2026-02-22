import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

// THIS IS CRITICAL: Stops Next.js from caching the route and failing the auth
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
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
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: CookieOptions) {
                        cookieStore.set({ name, value: '', ...options });
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // Success! Hardcoded redirect to bypass the Railway proxy confusion
            return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');
        } else {
            // If it fails, log the EXACT reason to your Railway dashboard
            console.error('SUPABASE OAUTH ERROR:', error.message);
        }
    }

    // Fallback if no code is found or an error occurs
    return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/login?error=auth_failed');
}
