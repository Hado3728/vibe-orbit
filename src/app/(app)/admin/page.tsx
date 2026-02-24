import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportsDashboard from '@/components/admin/ReportsDashboard'

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('is_admin, username, email')
        .eq('id', user.id)
        .single()

    if (!profile?.is_admin) {
        redirect('/dashboard')
    }

    // Fetch reports with related user info
    // In a real app, you might want to join with public.users to get usernames
    const { data: reports, error } = await supabase
        .from('reports')
        .select(`
            *,
            reporter:reporter_id (username),
            reported:reported_user_id (username)
        `)
        .order('timestamp', { ascending: false })

    if (error) {
        console.error('Error fetching reports:', error)
    }

    return (
        <div className="min-h-screen p-4 md:p-8 bg-black text-white">
            <header className="mb-8">
                <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Moderation Command Center
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    Logged in as <span className="text-gray-300 font-bold">{profile.username}</span> (Super Admin)
                </p>
            </header>

            <ReportsDashboard initialReports={reports || []} currentAdminId={user.id} />
        </div>
    )
}
