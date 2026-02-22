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
                    // FOR OLDER VERSIONS (Bypassing Railway Cache)
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        try { cookieStore.set({ name, value, ...options }); } catch (e) { }
                    },
                    remove(name: string, options: any) {
                        try { cookieStore.set({ name, value: '', ...options }); } catch (e) { }
                    },
                    // FOR NEWER VERSIONS (Next.js 15)
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) { }
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
