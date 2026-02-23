import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    try {
        // 1. Create an unmodified response 
        let supabaseResponse = NextResponse.next({
            request,
        })

        // 2. Initialize Supabase strictly with modern methods
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

        // 3. Refresh the auth token
        await supabase.auth.getUser()

        return supabaseResponse

    } catch (err) {
        // 🔥 THE SAFETY NET: If Supabase crashes, DO NOT break the website. Just let them through.
        console.error("MIDDLEWARE CRASH CAUGHT:", err)
        return NextResponse.next()
    }
}

// Ensure middleware ONLY runs on pages, never on images, CSS, or static files
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
