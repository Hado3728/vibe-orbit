import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "No code provided" });
        }

        // 1. Create the final destination response BEFORE initializing Supabase
        const response = NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');
        const cookieStore = await cookies();

        // 2. Initialize Supabase and force it to write cookies into our 'response' object
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                // We use "as any" to force TypeScript to accept our universal methods
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        response.cookies.set(name, value, options);
                    },
                    remove(name: string, options: any) {
                        response.cookies.set(name, '', { ...options, maxAge: 0 });
                    },
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            response.cookies.set(name, value, options);
                        });
                    }
                } as any
            }
        );

        // 3. Exchange code
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            return NextResponse.json({ error: "Supabase Rejected", details: error.message });
        }

        // 4. Ship the response with the baked-in cookies
        return response;

    } catch (err: any) {
        return NextResponse.json({
            error: "FATAL SERVER CRASH",
            message: err.message
        });
    }
}
