'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Radar, ShieldCheck } from 'lucide-react'

// Exporting the stagger variant so sibling UI components (like MatchCards mapped inside Dashboard) can hook into the orchestration.
export const cardRevealItem = {
    hidden: { opacity: 0, y: 50, rotateX: 15, scale: 0.95 },
    show: { 
        opacity: 1, 
        y: 0, 
        rotateX: 0, 
        scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
}

export default function OrbitReveal({ 
    children, 
    isNewDrop 
}: { 
    children: React.ReactNode, 
    isNewDrop: boolean 
}) {
    const [phase, setPhase] = useState<'calculating' | 'revealing'>(isNewDrop ? 'calculating' : 'revealing')
    const [textState, setTextState] = useState(0)

    useEffect(() => {
        if (!isNewDrop) return
        
        // Sequence timing for the suspense buildup
        const textTimer = setTimeout(() => setTextState(1), 1500)
        
        // Trigger the visual reveal frame
        const phaseTimer = setTimeout(() => {
            setPhase('revealing')
        }, 2500) 

        return () => {
            clearTimeout(textTimer)
            clearTimeout(phaseTimer)
        }
    }, [isNewDrop])

    // Container for the stagger effect 
    const revealContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    }

    if (!isNewDrop) {
        // Render instantly if logging in mid-cooldown
        return (
            <motion.div 
                variants={revealContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {children}
            </motion.div>
        )
    }

    return (
        <div className="relative w-full min-h-[400px] flex flex-col items-center justify-center pt-8">
            <AnimatePresence mode="wait">
                {phase === 'calculating' ? (
                    <motion.div
                        key="radar"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                        className="flex flex-col items-center justify-center text-center space-y-12 my-20"
                    >
                        {/* Deep Purple Radar UI */}
                        <div className="relative w-32 h-32 flex items-center justify-center">
                            <motion.div 
                                animate={{ scale: [1, 2.5, 3], opacity: [0.8, 0.2, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full border border-purple-500/50 bg-purple-900/10"
                            />
                            <motion.div 
                                animate={{ scale: [1, 1.8, 2.2], opacity: [0.8, 0.3, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
                                className="absolute inset-0 rounded-full border border-purple-500/30 bg-purple-900/5"
                            />
                            <div className="relative z-10 w-20 h-20 rounded-full bg-[#0a0a0a] border border-purple-600/50 flex items-center justify-center shadow-[0_0_40px_rgba(147,51,234,0.5)]">
                                <Radar className="w-10 h-10 text-purple-400 opacity-90 animate-[spin_3s_linear_infinite]" />
                            </div>
                        </div>

                        {/* Classified Text Sequence */}
                        <div className="h-8 relative overflow-hidden flex items-center justify-center min-w-[300px]">
                            <AnimatePresence mode="wait">
                                {textState === 0 ? (
                                    <motion.div
                                        key="decrypt"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute text-purple-300/80 font-mono tracking-widest text-sm uppercase"
                                    >
                                        Decrypting Vibe Alignment...
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="established"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute text-purple-400 font-mono font-bold tracking-widest text-sm uppercase flex items-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" />
                                        Orbit Established
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="results"
                        variants={revealContainer}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full perspective-[1000px]"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
