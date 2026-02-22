import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
                    // Modern @supabase/ssr v0.5+ API (Strictly required for Next.js 15/16)
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) {
                            // Expected: Next.js throws if cookies are set after the response starts
                            // but @supabase/ssr handles this internally.
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');
        } else {
            console.error("SUPABASE OAUTH ERROR:", error.message);
        }
    }

    return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/login?error=auth_failed');
}
