import { Sidebar } from '@/components/layout/Sidebar'
import Navbar from '@/components/layout/Navbar'

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-transparent">
            <Sidebar className="hidden md:block w-64 flex-shrink-0" />
            <div className="flex flex-col flex-1 h-full overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6 pt-20">
                    {children}
                </main>
            </div>
        </div>
    )
}
