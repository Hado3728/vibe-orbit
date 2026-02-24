import { Sidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 1. Check Auth Session
    const { data: { user } } = await supabase.auth.getUser()

    // If NO session, go to login
    if (!user) {
        redirect('/login')
    }

    // 2. Check Profile Status (The Vibe Guard)
    const { data: profile } = await supabase
        .from('users')
        .select('onboarded')
        .eq('id', user.id)
        .single()

    // If session exists but profile is missing or not onboarded, go to onboarding
    // DO NOT redirect to /login here.
    if (!profile || !profile.onboarded) {
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
