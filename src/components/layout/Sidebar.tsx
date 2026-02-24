'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/helpers'
import { Button } from '@/components/ui/Button'
import { LayoutDashboard, MessageSquare, User, Settings, Shield, Menu, UserPlus } from 'lucide-react'


// Actually, for a scalable architecture, a Sheet (Drawer) is best. But I'll stick to a simple sidebar implementation that works on desktop and hidden on mobile with a toggle button that I will implement locally in the Layout for now or here.
// Let's assume standard sidebar for desktop.

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Orbit', href: '/dashboard' },
    { icon: MessageSquare, label: 'Chats', href: '/chat' }, // Placeholder href, likely needs logic
    { icon: UserPlus, label: 'Requests', href: '/requests' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: Shield, label: 'Admin', href: '/admin' },
]

export const Sidebar = ({ className }: { className?: string }) => {
    const pathname = usePathname()

    return (
        <div className={cn(
            "pb-12 w-64 border-r border-white/20 dark:border-white/10 h-full bg-white/30 dark:bg-black/30 backdrop-blur-xl hidden md:block transition-all",
            className
        )}>
            <div className="space-y-4 py-6">
                <div className="px-4 py-2">
                    <h2 className="mb-4 px-2 text-xs font-bold tracking-[0.3em] uppercase text-foreground/40">
                        Discover
                    </h2>
                    <div className="space-y-1.5">
                        {sidebarItems.map((item) => (
                            <Link key={item.href} href={item.href} className="block group">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start h-10 px-3 rounded-xl transition-all duration-200",
                                        pathname?.startsWith(item.href)
                                            ? "bg-primary/10 text-primary shadow-sm shadow-primary/5"
                                            : "text-foreground/70 hover:bg-white/10 dark:hover:bg-white/5 hover:text-foreground"
                                    )}
                                >
                                    <item.icon className={cn(
                                        "mr-3 h-4 w-4 transition-colors",
                                        pathname?.startsWith(item.href) ? "text-primary" : "text-foreground/50 group-hover:text-foreground"
                                    )} />
                                    <span className="font-medium">{item.label}</span>
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
