export default function ProfileLoading() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 animate-pulse" />
                <div className="space-y-3">
                    <div className="h-10 w-56 bg-white/10 rounded-2xl animate-pulse" />
                    <div className="h-4 w-40 bg-white/5 rounded-lg animate-pulse" />
                </div>
            </div>

            {/* Profile Form Card Skeleton */}
            <div className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-16 bg-white/5 border-b border-white/10 flex items-center px-6">
                    <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
                </div>
                <div className="p-6 space-y-8">
                    {/* Fields */}
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                            <div className="h-12 w-full bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                            <div className="h-32 w-full bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                        </div>
                        <div className="space-y-3">
                            <div className="h-3 w-24 bg-white/5 rounded animate-pulse" />
                            <div className="flex gap-2">
                                <div className="h-12 flex-1 bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                                <div className="h-12 w-12 bg-white/5 rounded-xl border border-white/10 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
