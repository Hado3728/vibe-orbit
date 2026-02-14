import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) return response

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next()
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Define routes that anyone can access without logging in
    const isPublicRoute =
        path === '/' ||
        path === '/login' ||
        path === '/verify' ||
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path === '/favicon.ico'

    if (!user) {
        // Not logged in + trying to access private route = kick to login
        if (!isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    } else {
        // Logged in user logic
        const onboarded = user.user_metadata?.onboarded === true

        if (!onboarded) {
            // Not onboarded + trying to access dashboard = kick to onboarding
            if (path !== '/onboarding' && !isPublicRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
        } else {
            // Fully onboarded + trying to access login/onboarding = kick to dashboard
            if (path === '/login' || path === '/verify' || path === '/onboarding') {
                const url = request.nextUrl.clone()
                url.pathname = '/dashboard'
                return NextResponse.redirect(url)
            }
        }
    }

    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}