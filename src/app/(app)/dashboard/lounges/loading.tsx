export default function LoungesLoading() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6 sm:p-10 animate-pulse selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header Skeleton */}
                <header className="space-y-4">
                    <div className="h-12 w-64 bg-purple-900/30 rounded-xl"></div>
                    <div className="h-6 w-full max-w-2xl bg-purple-900/20 rounded-lg"></div>
                </header>

                {/* Lounges Grid Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div 
                            key={i}
                            className="flex flex-col justify-between p-6 sm:p-8 rounded-[2rem] bg-black/40 border border-purple-900/30 min-h-[240px] shadow-sm"
                        >
                            <div className="space-y-5 w-full">
                                <div className="h-8 w-3/4 bg-purple-900/40 rounded-lg"></div>
                                <div className="space-y-2">
                                    <div className="h-3 w-full bg-purple-900/20 rounded-sm"></div>
                                    <div className="h-3 w-5/6 bg-purple-900/20 rounded-sm"></div>
                                    <div className="h-3 w-4/6 bg-purple-900/20 rounded-sm"></div>
                                </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-purple-900/20 flex items-center justify-between">
                                <div className="h-4 w-16 bg-purple-900/30 rounded-md"></div>
                                <div className="h-10 w-32 bg-purple-900/40 border border-purple-800/30 rounded-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
