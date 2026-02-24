import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    let currentStep = '0. Booting Route';

    try {
        currentStep = '1. Dynamic Runtime Import (Bypassing Turbopack)';
        // THE FIX: We dynamically import Supabase strictly at runtime so the compiler can't break it
        const { createServerClient } = await import('@supabase/ssr');

        if (typeof createServerClient !== 'function') {
            throw new Error("Dynamic import failed! createServerClient is still missing.");
        }

        currentStep = '2. Parsing URL';
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: "No OAuth code provided by Google" });
        }

        currentStep = '3. Awaiting Cookies';
        const cookieStore = await cookies();

        currentStep = '4. Initializing Supabase';
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: any[]) {
                        try {
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
        return NextResponse.json({
            error: "FATAL SERVER CRASH",
            failed_at_step: currentStep,
            message: err.message,
            stack: err.stack
        });
    }
}
