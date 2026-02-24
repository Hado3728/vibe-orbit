import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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

    // IMPORTANT: Use getUser() for fresh, secure server-side verification
    const { data: { user } } = await supabase.auth.getUser()

    const url = new URL(request.url)
    const { pathname } = url

    // Step D: ALWAYS ignore internal paths and static assets
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/auth') ||
        pathname.includes('.') // matches favicon, images, etc.
    ) {
        return supabaseResponse
    }

    // Guard against redundant redirects: If already on a target page, skip
    const isOnOnboarding = pathname.startsWith('/onboarding') || pathname.startsWith('/quiz')
    const isOnDashboard = pathname.startsWith('/dashboard') || pathname.startsWith('/profile') || pathname.startsWith('/admin')
    const isOnLogin = pathname.startsWith('/login')

    // Step A: Protect App Routes
    if (isOnDashboard && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Step B & C: Handle Onboarding Progress
    if (user) {
        // Fetch fresh profile state
        const { data: profile } = await supabase
            .from('users')
            .select('onboarded')
            .eq('id', user.id)
            .single()

        const onboarded = profile?.onboarded || false

        // If not onboarded and trying to access app, redirect to onboarding
        if (isOnDashboard && !onboarded) {
            return NextResponse.redirect(new URL('/onboarding', request.url))
        }

        // Step C: If onboarded and trying to access onboarding/login, redirect to dashboard
        if ((isOnOnboarding || isOnLogin) && onboarded) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
