import { Sparkles, ArrowRight, User } from 'lucide-react'

interface MatchCardProps {
    name: string;
    matchScore: number;
    sharedInterests: string[];
    bio: string;
    avatarUrl?: string;
    onAction?: () => void;
    actionText?: React.ReactNode;
    isActionDisabled?: boolean;
}

export default function MatchCard({ name, matchScore, sharedInterests, bio, avatarUrl, onAction, actionText, isActionDisabled }: MatchCardProps) {
    return (
        <div className="group relative w-full overflow-hidden rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-7 transition-all duration-500 hover:shadow-lg hover:border-slate-700 flex flex-col h-full gap-6">
            
            {/* Top Section - Match % */}
            <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400 opacity-80" />
                    <span className="text-purple-400 font-semibold tracking-wide text-sm">
                        {matchScore}% Alignment
                    </span>
                </div>
            </div>

            {/* Middle Section - Avatar & Identity */}
            <div className="flex items-center gap-5 z-10 mt-1">
                {avatarUrl ? (
                    <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 bg-black/50 ring-1 ring-purple-900/40">
                        {/* 
                            Heavy blur applied for the blind connection aesthetic. 
                            Scale-110 ensures edges of the blur don't create sharp cutoffs.
                        */}
                        <img 
                            src={avatarUrl} 
                            alt="Encrypted Avatar" 
                            className="w-full h-full object-cover blur-md scale-110 opacity-70 transition-opacity duration-500 group-hover:opacity-90"
                        />
                    </div>
                ) : (
                    <div className="w-16 h-16 rounded-full shrink-0 bg-purple-950/30 border border-purple-900/40 flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-700/60" />
                    </div>
                )}
                
                <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-slate-100 tracking-tight">{name}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 mt-1 leading-relaxed font-light">
                        {bio}
                    </p>
                </div>
            </div>

            {/* Shared Interests */}
            <div className="flex flex-wrap gap-2 z-10 mt-auto pt-2">
                {sharedInterests.map((interest, idx) => (
                    <span 
                        key={idx} 
                        className="bg-purple-900/30 text-purple-200 border border-purple-800/50 text-xs px-3 py-1.5 rounded-full font-medium tracking-wide"
                    >
                        {interest}
                    </span>
                ))}
            </div>

            {/* Action Button */}
            <button 
                onClick={onAction}
                disabled={isActionDisabled}
                className="w-full mt-3 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:bg-purple-900/50 disabled:text-purple-300 disabled:cursor-not-allowed text-purple-50 font-semibold transition-colors duration-300 z-10 focus:ring-2 focus:ring-purple-500/50 outline-none"
            >
                {actionText || "Initiate Orbit"}
                {!isActionDisabled && <ArrowRight className="w-4 h-4 opacity-80 transition-transform group-hover:translate-x-1" />}
            </button>
        </div>
    )
}
