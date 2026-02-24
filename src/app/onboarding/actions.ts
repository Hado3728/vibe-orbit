'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function onboardUser(formData: {
    username: string
    age: number
    interests: string[]
    quizAnswers: number[]
}) {
    const supabase = await createClient()

    // 1. Get Current User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        // 2. Update Auth Metadata (Double-check sync)
        const { error: authError } = await supabase.auth.updateUser({
            data: {
                onboarded: true,
                age_verified: true,
                username: formData.username
            }
        })
        if (authError) throw authError

        // 3. Upsert to public.users (Crucial: set onboarded = true here)
        const { error: dbError } = await supabase.from('users').upsert({
            id: user.id,
            username: formData.username,
            age: formData.age,
            interests: formData.interests,
            quiz_answers: formData.quizAnswers,
            onboarded: true, // This is what the Vibe Guard looks for
            created_at: new Date().toISOString()
        })
        if (dbError) throw dbError

        // 4. Atomic Cache Revalidation
        // This clears the "un-onboarded" state from the Server Component cache
        revalidatePath('/', 'layout')

    } catch (error: any) {
        console.error('Onboarding Error:', error)
        return { success: false, error: error.message }
    }

    // 5. Force Move to Dashboard
    redirect('/dashboard')
}
