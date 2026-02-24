import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Clean Middleware - Auth Only
 * Handles basic session protection.
 * Onboarding and Profile checks are deferred to Server Component Layouts
 * to avoid Edge-caching stale data and high-latency DB calls in the middleware.
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

    // Check session
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

    // --- STRIPPED ROUTING LOGIC ---

    // A. Unauthorized access -> Login
    if (isAppPath && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // B. Auto-Login -> Dashboard
    if (user && isAuthPath) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // C. Everything else (Onboarding, Quiz, Layouts) is handled by the respective pages/layouts
    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
