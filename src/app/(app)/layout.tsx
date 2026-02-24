import { Sidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

/**
 * AppLayout
 * Redirection logic is handled by middleware.ts for better performance 
 * and to prevent infinite redirect loops during onboarding.
 */
export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
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
