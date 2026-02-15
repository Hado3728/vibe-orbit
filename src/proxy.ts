import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    // If keys are missing, just let the request through. No error, no crash.
    if (!supabaseUrl || !supabaseKey) {
        return response
    }

    try {
        const supabase = createServerClient(supabaseUrl, supabaseKey, {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (cookiesToSet) => {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                    response = NextResponse.next()
                    cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
                },
            },
        })

        await supabase.auth.getUser()
    } catch (e) {
        // If auth fails for any reason, don't crash the whole site.
        return response
    }

    return response
}

export const config = {
    matcher: ['/dashboard/:path*', '/onboarding/:path*', '/chat/:path*', '/admin/:path*'],
}