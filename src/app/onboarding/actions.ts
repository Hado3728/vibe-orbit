'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

/**
 * onboardUser
 * VIP PASS EDITION:
 * Atomic server action to finalize user registration and break the redirect loop.
 * Includes manual 'has_onboarded' cookie override to bypass edge caching.
 */
export async function onboardUser(formData: {
    username: string
    age: number
    interests: string[]
    quizAnswers: number[]
}) {
    console.log("🚀 STARTING ONBOARDING SUBMISSION for:", formData.username);
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        console.error("❌ AUTH FAILED during onboarding:", userError);
        return { success: false, error: 'Authentication failed. Please log in again.' }
    }

    try {
        // 2. Update Auth Metadata (For fast session-based checks)
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                onboarded: true,
                age_verified: true,
                username: formData.username
            }
        })
        if (authError) {
            console.error("❌ AUTH METADATA UPDATE FAILED:", authError);
            throw new Error(`Auth Update Failed: ${authError.message}`)
        }
        console.log("✅ AUTH METADATA SYNCED");

        // 3. Update/Upsert public.users profile (Source of Truth)
        const { data: dbData, error: dbError } = await supabase.from('users').upsert({
            id: user.id,
            username: formData.username.toLowerCase(),
            age: formData.age,
            interests: formData.interests,
            quiz_answers: formData.quizAnswers,
            onboarded: true,
            created_at: new Date().toISOString()
        }).select()

        if (dbError) {
            console.error("❌ DATABASE UPSERT FAILED:", dbError);
            throw new Error(`Database Update Failed: ${dbError.message}`)
        }
        console.log("✅ DATABASE UPDATE SUCCESS:", dbData);

        // 4. THE VIP PASS: Set Bypass Cookie
        // This cookie is checked by Middleware before any Supabase logic to break loops.
        const cookieStore = await cookies();
        cookieStore.set('has_onboarded', 'true', {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        console.log("✅ VIP PASS (has_onboarded) COOKIE SET");

        // 5. CACHE DESTRUCTION
        // We nuke the router cache for the entire site to ensure the layout guard picks up the change
        revalidatePath('/', 'layout')
        console.log("✅ SITE CACHE INVALIDATED");

    } catch (error: any) {
        // Essential: Allow Next.js redirect to function
        if (error.message === 'NEXT_REDIRECT') throw error;

        console.error('CRITICAL ONBOARDING ERROR:', error)
        return { success: false, error: error.message }
    }

    // 6. Force Move to Dashboard
    console.log("🏁 REDIRECTING TO DASHBOARD");
    redirect('/dashboard')
}
