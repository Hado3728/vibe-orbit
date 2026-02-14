'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const loadingMessages = [
    "Syncing frequencies...",
    "Calculating Orbit match...",
    "Securing your space...",
    "Calibrating vibes..."
]

export function LoadingVibe() {
    const [messageIndex, setMessageIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % loadingMessages.length)
        }, 1500)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-slate-950 to-purple-900/20" />

            {/* Pulsing Orb */}
            <motion.div
                className="relative z-10 w-24 h-24 rounded-full bg-indigo-500 blur-xl opacity-50"
                animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <div className="absolute z-10 w-16 h-16 rounded-full bg-white blur-md opacity-80" />

            {/* Text */}
            <div className="relative z-20 mt-12 h-8">
                <motion.p
                    key={messageIndex}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium text-indigo-200 tracking-wide"
                >
                    {loadingMessages[messageIndex]}
                </motion.p>
            </div>
        </div>
    )
}
