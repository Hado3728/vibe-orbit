import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EditProfileForm from '@/components/profile/EditProfileForm'
import { User } from 'lucide-react'

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
            <header className="flex items-center gap-6">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative h-24 w-24 rounded-full border-2 border-white/20 overflow-hidden bg-white/5 flex items-center justify-center">
                        {user.user_metadata?.avatar_url ? (
                            <img
                                src={user.user_metadata.avatar_url}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <User className="h-10 w-10 text-primary/40" />
                        )}
                    </div>
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        User Profile
                    </h1>
                    <p className="text-foreground/50 font-medium">
                        Welcome back, <span className="text-primary">@{profile.username}</span>
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-8">
                <EditProfileForm
                    initialData={{
                        username: profile.username || '',
                        bio: profile.bio || '',
                        interests: profile.interests || [],
                    }}
                />
            </div>
        </div>
    )
}
