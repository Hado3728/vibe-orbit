'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'

// Placeholder deep purple/cosmic gradients for avatars
const AVATARS = [
    { id: 'av_1', gradient: 'bg-gradient-to-tr from-purple-900 via-indigo-900 to-black' },
    { id: 'av_2', gradient: 'bg-gradient-to-tr from-violet-900 via-purple-900 to-slate-900' },
    { id: 'av_3', gradient: 'bg-gradient-to-bl from-fuchsia-900 via-purple-950 to-black' },
    { id: 'av_4', gradient: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-900' },
    { id: 'av_5', gradient: 'bg-gradient-to-t from-black via-purple-900 to-indigo-950' },
]

const ICEBREAKER_PROMPTS = [
    "The fastest way to my heart is...",
    "Do not message me unless...",
    "A controversial opinion I hold...",
    "My current hyper-fixation is...",
    "I will instantly respect you if..."
]

export default function DossierPage() {
    const router = useRouter()
    const supabase = createClient()
    
    // Form State
    const [avatarId, setAvatarId] = useState<string>(AVATARS[0].id)
    const [icebreakerPrompt, setIcebreakerPrompt] = useState<string>(ICEBREAKER_PROMPTS[0])
    const [icebreakerAnswer, setIcebreakerAnswer] = useState<string>('')
    const [socialBattery, setSocialBattery] = useState<number>(50)
    
    // UI State
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (!user) throw new Error('Not authenticated')

            // Update custom profile fields in the public.users table
            const { error: updateError } = await supabase
                .from('users')
                .update({
                    avatar_id: avatarId,
                    icebreaker_prompt: icebreakerPrompt,
                    icebreaker_answer: icebreakerAnswer,
                    social_battery_level: socialBattery
                })
                .eq('id', user.id)

            if (updateError) throw updateError

            // Optionally, also stash this in auth metadata so it's globally accessible via session
            await supabase.auth.updateUser({
                data: {
                    avatar_id: avatarId,
                    icebreaker_prompt: icebreakerPrompt,
                    icebreaker_answer: icebreakerAnswer,
                    social_battery_level: socialBattery
                }
            })
            
            // Sync session cookies
            await supabase.auth.refreshSession()

            // CRITICAL: Push to dashboard upon success
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 sm:p-8 font-sans selection:bg-purple-500/30">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-xl bg-black/40 backdrop-blur-2xl border border-purple-900/30 rounded-[2rem] p-8 sm:p-10 shadow-2xl shadow-purple-900/10"
            >
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight mb-2">Profile Dossier</h1>
                    <p className="text-sm font-light text-slate-400">Establish your orbital identity.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    
                    {/* Avatar Selector */}
                    <div className="space-y-4">
                        <label className="text-xs font-semibold text-purple-300 uppercase tracking-widest pl-1 opacity-80">
                            Aesthetic Vector
                        </label>
                        <div className="flex gap-5 overflow-x-auto pb-6 pt-2 px-1 scrollbar-hide snap-x">
                            {AVATARS.map((av) => (
                                <button
                                    key={av.id}
                                    type="button"
                                    onClick={() => setAvatarId(av.id)}
                                    aria-label={`Select placeholder avatar ${av.id}`}
                                    className={`relative shrink-0 w-20 h-20 rounded-full cursor-pointer transition-all duration-300 snap-center
                                        ${av.gradient}
                                        ${avatarId === av.id 
                                            ? 'ring-2 ring-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)] scale-110' 
                                            : 'border border-purple-900/50 hover:border-purple-600/50 opacity-50 hover:opacity-100 scale-95 hover:scale-100'
                                        }
                                    `}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Icebreaker Configuration */}
                    <div className="space-y-4">
                        <label className="text-xs font-semibold text-purple-300 uppercase tracking-widest pl-1 opacity-80">
                            Icebreaker Protocol
                        </label>
                        <div className="space-y-3">
                            <div className="relative">
                                {/* Native select dropdown stylized */}
                                <select 
                                    value={icebreakerPrompt}
                                    onChange={(e) => setIcebreakerPrompt(e.target.value)}
                                    className="w-full bg-purple-950/20 border border-purple-900/40 rounded-xl px-4 py-4 text-slate-200 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500/50 appearance-none transition-colors cursor-pointer"
                                >
                                    {ICEBREAKER_PROMPTS.map(prompt => (
                                        <option key={prompt} value={prompt} className="bg-[#0a0a0a] text-slate-200">
                                            {prompt}
                                        </option>
                                    ))}
                                </select>
                                {/* Custom caret for the dropdown */}
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-purple-400/50">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                            
                            <input
                                type="text"
                                value={icebreakerAnswer}
                                onChange={(e) => setIcebreakerAnswer(e.target.value)}
                                placeholder="Write your response..."
                                required
                                maxLength={100}
                                className="w-full bg-black/50 border border-purple-900/30 rounded-xl px-4 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors text-sm"
                            />
                        </div>
                    </div>

                    {/* Social Battery Slider */}
                    <div className="space-y-4 pb-2">
                        <label className="text-xs font-semibold text-purple-300 uppercase tracking-widest pl-1 opacity-80">
                            Social Battery Level
                        </label>
                        <div className="pt-2">
                            {/* 
                                Note: Accent-color is a modern standardized CSS property for standardizing range inputs.
                                We combine it with minimal tailwind classes for the highly native, yet stylized look. 
                            */}
                            <input 
                                type="range" 
                                min="0" 
                                max="100" 
                                value={socialBattery}
                                onChange={(e) => setSocialBattery(parseInt(e.target.value))}
                                className="w-full h-1.5 bg-purple-950/40 rounded-lg appearance-none cursor-pointer accent-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                            />
                            <div className="flex justify-between items-center mt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <span>Observer</span>
                                <span>Instigator</span>
                            </div>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="text-rose-400 text-sm font-medium text-center bg-rose-950/20 py-3 rounded-lg border border-rose-900/30">
                            {error}
                        </div>
                    )}

                    {/* Execute Update */}
                    <div className="pt-4">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-700 text-purple-50 font-bold tracking-wide transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Establish Dossier
                                    <ArrowRight className="w-5 h-5 opacity-80" />
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </motion.div>
        </div>
    )
}
