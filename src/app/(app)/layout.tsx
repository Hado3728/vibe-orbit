import { Sidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * AppLayout (The Vibe Guard)
 * Performs the definitive server-side check for onboarding status.
 * This runs on every dashboard/app route request.
 */
export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Double-Check Auth (redundant but safe)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        redirect('/login')
    }

    // 2. Fetch Fresh Profile (Source of Truth)
    // We use .select('onboarded') to minimize payload
    const { data: profile, error: dbError } = await supabase
        .from('users')
        .select('onboarded')
        .eq('id', user.id)
        .single()

    // 3. The Guard Logic
    // If profile is missing (DB failed) or onboarded is false, send to onboarding
    if (dbError || !profile || !profile.onboarded) {
        console.log('AppLayout: User not onboarded, redirecting to /onboarding')
        redirect('/onboarding')
    }

    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            {/* Sidebar is fixed width, non-scrolling */}
            <Sidebar className="hidden md:block w-72 flex-shrink-0" />

            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <Navbar />

                {/* Main content area scrolls independently */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-24 custom-scrollbar">
                    <div className="max-w-7xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
