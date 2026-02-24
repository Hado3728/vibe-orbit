'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

/**
 * onboardUser
 * Atomic server action to finalize user registration and break the redirect loop.
 */
export async function onboardUser(formData: {
    username: string
    age: number
    interests: string[]
    quizAnswers: number[]
}) {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
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
        if (authError) throw new Error(`Auth Update Failed: ${authError.message}`)

        // 3. Update/Upsert public.users profile (Source of Truth)
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

        // 4. THE LOOP KILLER: Clear the Next.js Cache
        // We nuke the router cache for the entire site to ensure the layout guard picks up the change
        revalidatePath('/', 'layout')

    } catch (error: any) {
        // Essential: Allow Next.js redirect to function
        if (error.message === 'NEXT_REDIRECT') throw error;

        console.error('CRITICAL ONBOARDING ERROR:', error)
        return { success: false, error: error.message }
    }

    // 5. Hard Redirect to Dashboard
    redirect('/dashboard')
}
