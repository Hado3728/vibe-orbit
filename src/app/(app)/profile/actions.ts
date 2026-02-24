'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: {
    username: string
    bio: string
    interests: string[]
}) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { success: false, error: 'Not authenticated' }
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({
                username: formData.username,
                bio: formData.bio,
                interests: formData.interests,
            })
            .eq('id', user.id)

        if (error) throw error

        revalidatePath('/profile')
        revalidatePath('/dashboard')

        return { success: true }
    } catch (error: any) {
        console.error('Error updating profile:', error)
        return { success: false, error: error.message }
    }
}
