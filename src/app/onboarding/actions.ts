'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * onboardUser
 * Atomic server action to finalize user registration.
 * Clean, standard Next.js 15 implementation.
 */
export async function onboardUser(formData: {
    username: string
    age: number
    interests: string[]
    quizAnswers: number[]
}) {
    console.log("🚀 SUBMITTING ONBOARDING:", formData.username);
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
        return { success: false, error: 'Authentication failed. Please log in again.' }
    }

    try {
        // 2. Sync Auth Metadata (For fast session-based checks if needed)
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                onboarded: true,
                username: formData.username
            }
        })
        if (authError) throw new Error(`Auth Update Failed: ${authError.message}`)
        console.log("✅ AUTH METADATA SYNCED");

        // CRITICAL: Refresh session on the server to ensure the updated metadata is baked into the JWT
        await supabase.auth.refreshSession()

        // 3. Update/Upsert public.users profile (The definitive Source of Truth)
        const { error: dbError } = await supabase.from('users').upsert({
            id: user.id,
            username: formData.username.toLowerCase(),
            age: formData.age,
            interests: formData.interests,
            quiz_answers: formData.quizAnswers,
            onboarded: true,
            created_at: new Date().toISOString()
        })

        if (dbError) throw new Error(`Database Update Failed: ${dbError.message}`)

        // 4. IMPORTANT: Nuke the Router Cache
        // This ensures the next request to /dashboard hits the server and triggers the Layout guard.
        revalidatePath('/', 'layout')

    } catch (error: any) {
        console.error('ONBOARDING ERROR:', error)
        return { success: false, error: error.message }
    }

    // Return success instead of redirecting purely server-side
    // Allows the client component to route cleanly without NEXT_REDIRECT catch-block loops.
    return { success: true }
}
