import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, ArrowRight, Sparkles } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function LoungesDirectory() {
    const supabase = await createClient()

    // Fetch lounges
    const { data: lounges, error } = await supabase
        .from('orbit_lounges')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error("Error fetching lounges:", error)
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] p-6 sm:p-10 font-sans selection:bg-purple-500/30">
            <div className="max-w-6xl mx-auto space-y-10">
                {/* Header */}
                <header className="space-y-3">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                        Orbit Lounges
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl font-light">
                        Enter global real-time synchronization zones. Connect with the cosmos based on pure frequency.
                    </p>
                </header>

                {/* Grid */}
                {lounges && lounges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lounges.map((lounge) => (
                            <div 
                                key={lounge.id} 
                                className="group relative flex flex-col justify-between p-6 sm:p-8 rounded-[2rem] bg-black/40 backdrop-blur-xl border border-purple-900/50 hover:border-purple-700/60 hover:shadow-[0_0_30px_rgba(147,51,234,0.15)] transition-all duration-500 min-h-[240px]"
                            >
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-bold text-slate-100 tracking-tight group-hover:text-purple-300 transition-colors">
                                        {lounge.name}
                                    </h3>
                                    <p className="text-sm text-slate-400 leading-relaxed font-light line-clamp-3">
                                        {lounge.description || "A synchronized zone for like-minded orbits."}
                                    </p>
                                </div>
                                
                                <div className="mt-8 pt-6 border-t border-purple-900/30 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-400/80 uppercase tracking-widest">
                                        <Users className="w-4 h-4" />
                                        <span>Global</span>
                                    </div>
                                    <Link 
                                        href={`/dashboard/lounges/${lounge.id}`}
                                        className="flex items-center gap-2 text-sm font-bold text-purple-300 hover:text-purple-100 transition-colors bg-purple-950/30 hover:bg-purple-900/40 px-4 py-2 rounded-full border border-purple-800/50 hover:border-purple-500/50 group-hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]"
                                    >
                                        Enter Lounge
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                    </Link>
                                </div>
                                {/* Ambient Glow */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-600/10 transition-colors" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 py-24 text-center border border-purple-900/30 bg-black/40 backdrop-blur-xl rounded-[2rem]">
                        <Sparkles className="w-12 h-12 text-purple-900/60 mb-6" />
                        <h3 className="text-xl font-bold text-slate-300 mb-2">No active lounges detected.</h3>
                        <p className="text-slate-500 font-light">The cosmos is quiet. Please check back later or spawn a new frequency.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
