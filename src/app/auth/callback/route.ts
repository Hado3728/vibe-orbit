import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Critical: Stops Next.js from caching the route
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
                    // Required syntax for @supabase/ssr v0.5+ and Next.js 15
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch {
                            // Safe to ignore in Route Handlers — Next.js handles cookie flushing
                        }
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');
        } else {
            console.error('SUPABASE OAUTH ERROR:', error.message);
        }
    }

    return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/login?error=auth_failed');
}
