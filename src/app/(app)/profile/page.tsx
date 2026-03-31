import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditProfileForm from '@/components/profile/EditProfileForm'
import { User, Calendar, Mail } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile) {
        redirect('/onboarding')
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Page Header */}
            <header className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white dark:bg-slate-950 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="relative group shrink-0">
                    <div className="relative h-28 w-28 rounded-full border-4 border-slate-100 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-12 w-12 text-slate-400" />
                        )}
                    </div>
                </div>
                <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            {profile.username}
                        </h1>
                        <p className="text-foreground/50 font-medium text-lg">
                            @{profile.username}
                        </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500 font-medium">
                        {user.email && (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800">
                            <Calendar className="h-4 w-4" />
                            Joined {new Date(profile.created_at || user.created_at).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <EditProfileForm
                    initialData={{
                        bio: profile.bio || '',
                        interests: profile.interests || [],
                    }}
                />
            </div>
        </div>
    )
}
