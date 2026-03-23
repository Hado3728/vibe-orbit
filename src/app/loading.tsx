import { Orbit } from 'lucide-react'

export default function GlobalLoading() {
    return (
        <div className="fixed inset-0 min-h-screen z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] overflow-hidden">
            {/* Deep Purple Pulsing Radar Hub */}
            <div className="relative w-40 h-40 flex items-center justify-center">
                {/* Outward rings */}
                <div className="absolute inset-0 rounded-full border border-purple-500/40 bg-purple-900/10 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                <div className="absolute inset-4 rounded-full border border-purple-500/30 bg-purple-900/20 animate-[ping_2.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
                
                {/* Core Orbit Node */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-black/80 backdrop-blur-md border border-purple-600/50 flex items-center justify-center shadow-[0_0_50px_rgba(147,51,234,0.6)]">
                    <Orbit className="w-12 h-12 text-purple-400 animate-[spin_3s_linear_infinite] opacity-90" />
                </div>
            </div>
            
            {/* System Status Text */}
            <div className="mt-10 text-xs font-mono font-bold tracking-[0.3em] text-purple-400/80 uppercase animate-pulse">
                Establishing Connection...
            </div>
        </div>
    )
}
