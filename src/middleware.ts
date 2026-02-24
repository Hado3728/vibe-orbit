import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Bulletproof Middleware - Auth Sync Edition
 * Forces fresh session verification via getUser() to bypass stale cookies.
 * Safeguards against the 'Quiz Loop' by checking user_metadata in real-time.
 */
export async function middleware(request: NextRequest) {
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

    // CRITICAL: Force fresh user data from Supabase Auth (not just the session cookie)
    const { data: { user } } = await supabase.auth.getUser()

    const url = new URL(request.url)
    const { pathname } = url

    // 1. Static/Internal path bypass
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth') ||
        pathname.includes('.')
    ) {
        return supabaseResponse
    }

    // Path classification
    const isAppPath = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/admin') ||
        pathname.startsWith('/rooms') ||
        pathname.startsWith('/chat') ||
        pathname.startsWith('/requests')

    const isAuthPath = pathname === '/login' || pathname === '/'
    const isOnboardingPath = pathname.startsWith('/onboarding') ||
        pathname.startsWith('/quiz') ||
        pathname.startsWith('/interests')

    // Onboarding status from fresh metadata
    const isOnboarded = user?.user_metadata?.onboarded === true

    // --- ROUTING LOGIC ---

    // A. Unauthorized access -> Login
    if (isAppPath && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // B. Auto-Login -> Dashboard (but check onboarding first)
    if (user && isAuthPath) {
        if (isOnboarded) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        } else {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }
    }

    // C. The Quiz Loop Killer: Prevent onboarded users from hitting onboarding/quiz
    if (user && isOnboardingPath && isOnboarded) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // D. Force Onboarding: Redirect un-onboarded users to onboarding if trying to access App
    if (user && isAppPath && !isOnboarded) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
