import { Sidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * AppLayout (The Definitive Vibe Guard)
 * This layout wraps all app routes (Dashboard, Profile, etc.).
 * It performs a synchronous, server-side database check for onboarding status.
 * Because it's a Server Component, it bypasses Edge caching issues.
 */
export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Get Fresh User Session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch Fresh Profile Row (The Source of Truth)
    const { data: profile, error: dbError } = await supabase
        .from('users')
        .select('onboarded')
        .eq('id', user.id)
        .single()

    // 3. The Guard Logic
    // If user profile doesn't exist yet OR they haven't finished onboarding,
    // they MUST be on the onboarding path. Since this layout is only for /(app),
    // we redirect them OUT to /onboarding.
    if (dbError || !profile || !profile.onboarded) {
        console.log('AppLayout [Gaurd]: Redirecting un-onboarded user to /onboarding')
        redirect('/onboarding')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            <Sidebar className="hidden md:block w-72 flex-shrink-0" />

            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <Navbar />

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24 custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
