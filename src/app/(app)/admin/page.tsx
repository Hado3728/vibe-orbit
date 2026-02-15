import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

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

    return (
        <div className="min-h-screen p-8 bg-gradient-to-br from-gray-900 to-gray-800 text-white font-mono">
            <div className="max-w-5xl mx-auto bg-white/5 backdrop-blur-md p-8 rounded-2xl border border-white/10 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-4 opacity-20">
                    <svg className="w-24 h-24 text-red-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <header className="mb-12 relative z-10">
                    <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                        Admin Headquarters 👑
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Welcome to God Mode. If you are reading this, your database recognized your admin privileges.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User Info Card */}
                    <div className="bg-black/40 p-6 rounded-xl border border-white/5">
                        <h2 className="text-xl font-bold text-gray-200 mb-4 border-b border-gray-700 pb-2">Active Admin Session</h2>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">User ID</span>
                                <span className="text-gray-300 font-mono">{user.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Username</span>
                                <span className="text-green-400 font-bold">{profile.username || 'Unknown'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email</span>
                                <span className="text-gray-300">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Role</span>
                                <span className="text-red-500 font-bold uppercase tracking-widest">Super Admin</span>
                            </div>
                        </div>
                    </div>

                    {/* System Status Placeholder */}
                    <div className="bg-black/40 p-6 rounded-xl border border-red-500/30 flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                        </div>
                        <div>
                            <h3 className="text-red-400 font-bold text-lg">System Controls Offline</h3>
                            <p className="text-red-500/70 text-sm mt-1">Awaiting frontend build...</p>
                        </div>
                        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-4">
                            <div className="w-1/3 h-full bg-red-600 animate-progress-indeterminate" />
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-600 text-xs">
                    SECURE CONNECTION ESTABLISHED • ENCRYPTED VIA SUPABASE
                </div>
            </div>
        </div>
    )
}
