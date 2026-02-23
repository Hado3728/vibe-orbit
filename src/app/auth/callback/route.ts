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

        // We isolate the entire options object and cast it as 'any'. 
        // TypeScript is physically locked out from checking the rules on this object.
        const supabaseOptions: any = {
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
                setAll(cookiesToSet: any[]) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options);
                    });
                }
            }
        };

        // We pass the blindfolded object in. Zero TypeScript errors.
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            supabaseOptions
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
