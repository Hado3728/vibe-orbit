export default function DashboardLoading() {
    return (
        <div className="min-h-screen bg-transparent p-4 md:p-8 animate-pulse selection:bg-purple-500/30">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Skeleton */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-3">
                        <div className="h-10 w-48 bg-purple-900/30 rounded-lg"></div>
                        <div className="h-5 w-72 bg-purple-900/20 rounded-md"></div>
                    </div>
                </header>

                {/* Top Orbit Timer Skeleton */}
                <div className="w-full max-w-md mx-auto h-40 bg-purple-900/20 border border-purple-800/30 rounded-[2rem] shadow-[0_0_30px_rgba(147,51,234,0.1)] mb-12"></div>

                {/* Match Cards Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {[1, 2, 3].map((i) => (
                        <div 
                            key={i} 
                            className="w-full h-[400px] overflow-hidden rounded-3xl bg-black/40 backdrop-blur-md border border-purple-900/30 p-6 sm:p-7 flex flex-col gap-6 shadow-sm"
                        >
                            {/* Match % Skeleton */}
                            <div className="h-8 w-28 bg-purple-900/40 rounded-full"></div>

                            {/* Avatar & Name Skeleton */}
                            <div className="flex items-center gap-5 mt-1">
                                <div className="w-16 h-16 rounded-full bg-purple-900/40 shrink-0 border border-purple-800/20"></div>
                                <div className="flex flex-col gap-3 w-full pt-1">
                                    <div className="h-6 w-3/4 bg-purple-900/30 rounded-md"></div>
                                    <div className="space-y-2 mt-1">
                                        <div className="h-3 w-full bg-purple-900/20 rounded-sm"></div>
                                        <div className="h-3 w-2/3 bg-purple-900/20 rounded-sm"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Shared Interests Skeleton (Pills) */}
                            <div className="flex gap-2 mt-auto pt-2">
                                <div className="h-6 w-16 bg-purple-900/30 rounded-full"></div>
                                <div className="h-6 w-20 bg-purple-900/30 rounded-full"></div>
                                <div className="h-6 w-14 bg-purple-900/30 rounded-full"></div>
                            </div>

                            {/* Button Skeleton */}
                            <div className="w-full h-12 mt-3 rounded-xl bg-purple-900/40 border border-purple-800/20"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
