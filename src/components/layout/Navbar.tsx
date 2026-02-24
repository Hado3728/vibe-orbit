'use client'

import Link from 'next/link'
import { useTheme } from 'next-themes'
import { Sun, Moon, Orbit, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const Navbar = () => {
    const { user, loading } = useUser()
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Avoid hydration mismatch by only rendering the toggle after mounting
    useEffect(() => setMounted(true), [])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/20 dark:border-white/10 bg-white/30 dark:bg-black/30 backdrop-blur-xl z-[60] flex items-center px-6 justify-between transition-all">
            <div className="flex items-center gap-2 cursor-pointer group" onClick={() => router.push('/')}>
                <div className="bg-primary/20 p-1.5 rounded-xl group-hover:scale-110 transition-transform">
                    <Orbit className="h-6 w-6 text-primary" />
                </div>
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Orbit</span>
            </div>

            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                {mounted && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="rounded-full w-10 h-10 bg-white/10 dark:bg-white/5 hover:bg-white/20 transition-all border border-white/10"
                    >
                        {theme === 'dark' ? (
                            <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500 transition-all" />
                        ) : (
                            <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-400 transition-all" />
                        )}
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                )}

                <div className="h-6 w-[1px] bg-white/10 mx-1 hidden sm:block" />

                {loading ? (
                    <Button variant="ghost" disabled className="text-muted-foreground">Loading...</Button>
                ) : user ? (
                    <>
                        <div className="text-sm font-medium text-foreground/80 hidden sm:block">
                            {user.user_metadata?.username || user.email?.split('@')[0]}
                        </div>

                        <form action="/api/auth/signout" method="post">
                            <Button
                                variant="ghost"
                                type="submit"
                                className="text-sm font-semibold hover:bg-white/10"
                            >
                                Sign Out
                            </Button>
                        </form>

                        <Link href="/profile">
                            <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 p-0 overflow-hidden border-2 border-primary/20 hover:border-primary/50 transition-all">
                                {user.user_metadata?.avatar_url ? (
                                    <img
                                        src={user.user_metadata.avatar_url}
                                        alt="Profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="bg-primary/10 h-full w-full flex items-center justify-center">
                                        <User className="h-5 w-5 text-primary" />
                                    </div>
                                )}
                            </Button>
                        </Link>
                    </>
                ) : (
                    <div className="flex items-center gap-2">
                        <Link href="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/login">
                            <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">Get Started</Button>
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
