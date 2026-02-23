import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "No code provided by Google" });
        }

        // Safety check: Are the Railway environment variables actually loading?
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return NextResponse.json({ error: "Missing Supabase Environment Variables on Server!" });
        }

        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
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

        if (error) {
            return NextResponse.json({ error: "Supabase Rejected the Login", details: error.message });
        }

        return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');

    } catch (err: any) {
        // THIS CATCHES THE FATAL CRASH AND PRINTS IT ON THE SCREEN
        return NextResponse.json({
            error: "FATAL SERVER CRASH",
            message: err.message,
            stack: err.stack
        });
    }
}
