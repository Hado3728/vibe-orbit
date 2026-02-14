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
        <div className={cn("pb-12 w-64 border-r h-full bg-background/50 backdrop-blur-xl hidden md:block", className)}>
            <div className="space-y-4 py-4">
                <div className="px-3 py-2">
                    <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                        Discover
                    </h2>
                    <div className="space-y-1">
                        {sidebarItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname?.startsWith(item.href) ? "secondary" : "ghost"}
                                    className="w-full justify-start"
                                >
                                    <item.icon className="mr-2 h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
