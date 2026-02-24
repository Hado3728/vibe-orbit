import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Bulletproof Middleware - VIP PASS VERSION
 * Standardized session maintenance & basic route protection.
 * Added high-priority 'has_onboarded' cookie check to instantly kill quiz loops.
 */
export async function middleware(request: NextRequest) {
    const url = new URL(request.url)
    const { pathname } = url

    // --- STEP 0: VIP PASS BYPASS ---
    // If the user has the 'has_onboarded' cookie, instantly warp them to dashboard if they are on /quiz
    const hasOnboardedCookie = request.cookies.get('has_onboarded')?.value === 'true'

    if ((pathname === '/quiz' || pathname === '/onboarding') && hasOnboardedCookie) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Use getUser() for secure session verification
    const { data: { user } } = await supabase.auth.getUser()

    // 1. ALWAYS ignore internal paths and static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth') ||
        pathname.includes('.')
    ) {
        return supabaseResponse
    }

    // Path classification
    const isOnDashboard = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/rooms')

    const isOnAuth = pathname.startsWith('/login') || pathname === '/'

    // 2. Protect App Routes (Session Check Only)
    if (isOnDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Auto-Login (Redirect to dashboard if session exists and hitting /, /login)
    // Note: If they aren't onboarded, the AppLayout will catch them and send to /onboarding.
    if (user && isOnAuth) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
