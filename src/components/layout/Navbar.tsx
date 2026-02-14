'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Orbit, User } from 'lucide-react'
import { useUser } from '@/hooks/useUser'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const Navbar = () => {
    const { user, loading } = useUser()
    const router = useRouter()
    const supabase = createClient()

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
        router.refresh()
    }

    return (
        <nav className="fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-sm z-50 flex items-center px-6 justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                <Orbit className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl tracking-tight">Orbit</span>
            </div>
            <div className="flex items-center gap-4">
                {loading ? (
                    <Button variant="ghost" disabled>Loading...</Button>
                ) : user ? (
                    <>
                        <div className="text-sm text-muted-foreground hidden sm:block">
                            {user.email}
                        </div>
                        <form action="/auth/signout" method="post">
                            <Button variant="ghost" type="submit">Sign Out</Button>
                        </form>
                        <Link href="/profile">
                            <Button size="icon" variant="secondary" className="rounded-full">
                                <User className="h-4 w-4" />
                            </Button>
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/login">
                            <Button variant="ghost">Login</Button>
                        </Link>
                        <Link href="/login">
                            <Button>Get Started</Button>
                        </Link>
                    </>
                )}
            </div>
        </nav>
    )
}

export default Navbar
