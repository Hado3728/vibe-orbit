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

        const response = NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');
        const cookieStore = await cookies();

        // THE TROJAN HORSE
        // We create an empty 'any' object so TypeScript ignores it completely.
        const cookieMethods = {} as any;

        // We sneak the Legacy methods in one by one (Bypasses the "Object literal" strict check)
        cookieMethods.get = (name: string) => cookieStore.get(name)?.value;
        cookieMethods.set = (name: string, value: string, options: any) => response.cookies.set(name, value, options);
        cookieMethods.remove = (name: string, options: any) => response.cookies.set(name, '', { ...options, maxAge: 0 });

        // We sneak the Modern methods in
        cookieMethods.getAll = () => cookieStore.getAll();
        cookieMethods.setAll = (cookiesToSet: any[]) => {
            cookiesToSet.forEach(({ name, value, options }) => {
                response.cookies.set(name, value, options);
            });
        };

        // We pass the fully loaded Trojan Horse to Supabase
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: cookieMethods }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            return NextResponse.json({ error: "Supabase Rejected", details: error.message });
        }

        return response;

    } catch (err: any) {
        return NextResponse.json({
            error: "FATAL SERVER CRASH",
            message: err.message
        });
    }
}
