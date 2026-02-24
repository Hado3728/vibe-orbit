import { NextResponse } from 'next/server';
// THE FIX: We import the ENTIRE module to stop Turbopack from destroying the named exports
import * as SupabaseSSR from '@supabase/ssr';
import * as NextHeaders from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    let currentStep = '0. Booting Route';

    try {
        currentStep = '1. Bypassing Turbopack Interop';
        // If Turbopack drops the export, this will catch it immediately instead of throwing void 0
        if (typeof SupabaseSSR.createServerClient !== 'function') {
            throw new Error(`Turbopack dropped createServerClient! Available exports: ${Object.keys(SupabaseSSR).join(', ')}`);
        }
        if (typeof NextHeaders.cookies !== 'function') {
            throw new Error("Next.js cookies() function is missing from headers!");
        }

        currentStep = '2. Parsing URL';
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "No OAuth code provided by Google" });
        }

        currentStep = '3. Awaiting Cookies';
        const cookieStore = await NextHeaders.cookies();

        currentStep = '4. Initializing Supabase';
        const supabase = SupabaseSSR.createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            // Standard Next.js 15 route handler cookie setting
                            cookiesToSet.forEach(({ name, value, options }) => {
                                cookieStore.set(name, value, options);
                            });
                        } catch (error) {
                            // Safe to ignore in route handlers
                        }
                    },
                },
            }
        );

        currentStep = '5. Exchanging Code for Session';
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            throw new Error(`Supabase Rejected Login: ${error.message}`);
        }

        currentStep = '6. Redirecting to Dashboard';
        return NextResponse.redirect('https://vibe-orbit-production.up.railway.app/dashboard');

    } catch (err: any) {
        // This will print EXACTLY which step failed
        return NextResponse.json({
            error: "FATAL SERVER CRASH",
            failed_at_step: currentStep,
            message: err.message,
            stack: err.stack
        });
    }
}
