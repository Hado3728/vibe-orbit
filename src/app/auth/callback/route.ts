// @ts-nocheck
import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "No code provided by Google" });
        }

        const cookieStore = await cookies();
        const response = NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');

        // The Titanium Wrapper: It physically cannot throw "is not a function"
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        // Safety check: Does 'get' actually exist on the server?
                        if (typeof cookieStore.get === 'function') {
                            const cookie = cookieStore.get(name);
                            return cookie ? cookie.value : undefined;
                        }
                        return undefined;
                    },
                    set(name, value, options) {
                        try {
                            if (typeof response.cookies.set === 'function') {
                                response.cookies.set(name, value, options);
                            }
                        } catch (e) { }
                    },
                    remove(name, options) {
                        try {
                            if (typeof response.cookies.set === 'function') {
                                response.cookies.set(name, '', { ...options, maxAge: 0 });
                            }
                        } catch (e) { }
                    },
                    getAll() {
                        if (typeof cookieStore.getAll === 'function') {
                            return cookieStore.getAll();
                        }
                        return [];
                    },
                    setAll(cookiesToSet) {
                        try {
                            if (!Array.isArray(cookiesToSet)) return;
                            cookiesToSet.forEach(({ name, value, options }) => {
                                if (typeof response.cookies.set === 'function') {
                                    response.cookies.set(name, value, options);
                                }
                            });
                        } catch (e) { }
                    }
                }
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            return NextResponse.json({ error: "Supabase Rejected the Login", details: error.message });
        }

        return response;

    } catch (err) {
        return NextResponse.json({
            error: "FATAL SERVER CRASH",
            message: err.message,
            stack: err.stack
        });
    }
}
