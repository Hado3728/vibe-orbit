import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PRODUCTION_URL = 'https://vibe-orbit-production.up.railway.app'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
        return NextResponse.redirect(`${PRODUCTION_URL}/login?error=auth_failed`)
    }

    try {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error('[auth/callback] exchangeCodeForSession error:', error.message)
            return NextResponse.redirect(`${PRODUCTION_URL}/login?error=auth_failed`)
        }

        return NextResponse.redirect(`${PRODUCTION_URL}/dashboard`)
    } catch (err) {
        console.error('[auth/callback] Unexpected error:', err)
        return NextResponse.redirect(`${PRODUCTION_URL}/login?error=auth_failed`)
    }
}
