import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 1. MUST be named 'middleware' for Next.js to recognize it
export async function middleware(request: NextRequest) {
    let response = NextResponse.next()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // 2. SAFETY CHECK: If keys aren't loaded yet, don't crash the server!
    if (!supabaseUrl || !supabaseKey) {
        console.error("BUILD ERROR: Supabase environment variables are missing in Middleware!")
        return response
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
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

    // This is the line that was likely crashing (void 0 is not a function)
    // because 'supabase.auth' doesn't exist if the client fails to init.
    const {
        data: { user },
    } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    const isPublicRoute =
        path === '/' ||
        path === '/login' ||
        path === '/verify' ||
        path.startsWith('/api') ||
        path.startsWith('/_next') ||
        path.startsWith('/static') ||
        path === '/favicon.ico'

    if (!user) {
        if (!isPublicRoute) {
            const url = request.nextUrl.clone()
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    } else {
        const onboarded = user.user_metadata?.onboarded === true

        if (!onboarded) {
            if (path !== '/onboarding' && !isPublicRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/onboarding'
                return NextResponse.redirect(url)
            }
        } else {
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