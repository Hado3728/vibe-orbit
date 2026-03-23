'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function triggerOrbitDrop() {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
        throw new Error('Unauthorized or no active session to trigger drop')
    }

    const { error } = await supabase
        .from('users')
        .update({ last_orbit_drop: new Date().toISOString() })
        .eq('id', user.id)

    if (error) {
        throw new Error('Failed to update Orbit Drop timestamp: ' + error.message)
    }

    revalidatePath('/dashboard')
}
