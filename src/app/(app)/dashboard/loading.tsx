export default function DashboardLoading() {
    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-4">
                    <div className="h-10 w-64 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl animate-pulse" />
                    <div className="h-4 w-48 bg-white/5 dark:bg-black/5 backdrop-blur-md rounded-lg animate-pulse" />
                </div>
                <div className="h-12 w-40 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-xl animate-pulse" />
            </div>

            {/* Orbit Feed Skeletons */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                        key={i}
                        className="h-[320px] bg-white/10 dark:bg-black/10 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl p-6 space-y-4 shadow-xl overflow-hidden"
                    >
                        {/* Avatar & Name */}
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-full bg-white/5 animate-pulse" />
                            <div className="space-y-2">
                                <div className="h-5 w-32 bg-white/10 rounded-lg animate-pulse" />
                                <div className="h-3 w-20 bg-white/5 rounded-md animate-pulse" />
                            </div>
                        </div>
                        {/* Bio Lines */}
                        <div className="space-y-2 pt-4">
                            <div className="h-4 w-full bg-white/5 rounded-md animate-pulse" />
                            <div className="h-4 w-[90%] bg-white/5 rounded-md animate-pulse" />
                            <div className="h-4 w-[75%] bg-white/5 rounded-md animate-pulse" />
                        </div>
                        {/* Tags */}
                        <div className="flex gap-2 pt-6">
                            <div className="h-8 w-20 bg-primary/10 rounded-full animate-pulse" />
                            <div className="h-8 w-24 bg-primary/10 rounded-full animate-pulse" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
