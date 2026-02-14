import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

export function useUser() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session
        supabase.auth.getUser().then(({ data: { user } }: { data: { user: User | null } }) => {
            setUser(user)
            setLoading(false)
        })

        // Listen for changes
        // @ts-ignore - Triggered by subscription type mismatch in older supabase-js versions
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
            setUser(session?.user ?? null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    return { user, loading }
}
