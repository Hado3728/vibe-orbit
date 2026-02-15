import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) return response

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
            getAll() { return request.cookies.getAll() },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
                response = NextResponse.next({ request })
                cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
            },
        },
    })

    const { data: { user } } = await supabase.auth.getUser()

    // 🚨 REDIRECT LOGIC: If no user, kick them to login
    const isProtectedraoute = ['/dashboard', '/onboarding', '/chat', '/admin'].some(path =>
        request.nextUrl.pathname.startsWith(path)
    )

    if (!user && isProtectedraoute) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    return response
}

export const config = {
    // Keep the matcher exactly as it is in your screenshot
    matcher: ['/dashboard/:path*', '/onboarding/:path*', '/chat/:path*', '/admin/:path*'],
}