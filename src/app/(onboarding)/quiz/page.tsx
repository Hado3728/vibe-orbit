'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { motion, AnimatePresence } from 'framer-motion'
import { findBestRoom } from '@/lib/matching'
import { ChevronRight, Sparkles } from 'lucide-react'

const QUESTIONS = [
    {
        id: 1,
        question: "What's your ideal background noise?",
        options: ["Complete silence 🤫", "Lo-fi beats 🎧", "TV in background 📺", "Coffee shop chaos ☕"]
    },
    {
        id: 2,
        question: "In a group chat, you are the...",
        options: ["Lurker 👀", "Leader 👑", "Memelord 🐸", "Therapist 🛋️"]
    },
    {
        id: 3,
        question: "Pick a weekly aesthetic",
        options: ["Cozy & Chill 🧸", "Chaotic Energy 🌪️", "Hyper-organized 📅", "Outdoor Adventures 🌲"]
    },
    {
        id: 4,
        question: "Small talk is...",
        options: ["Painful 😫", "Thinking of exit strategies 🏃", "Necessary evil 🤷", "Fun! I love yapping 🗣️"]
    },
    {
        id: 5,
        question: "Your room vibe is...",
        options: ["Minimalist ⬜", "Maximalist (Cluttercore) 📚", "Dark mode / RGB 🎮", "Plant parent 🌿"]
    },
    {
        id: 6,
        question: "Energy peak?",
        options: ["Early Bird 🌅", "Night Owl 🦉", "Afternoon Nap 😴", "Always on ⚡"]
    },
    {
        id: 7,
        question: "Texting style",
        options: ["Novel paragraphs 📖", "Rapid fire short texts 🔫", "Voice notes 🎙️", "Emoji only 🗿"]
    },
    {
        id: 8,
        question: "Conflict style",
        options: ["Peacekeeper 🏳️", "Debater 🥊", "Ghost 👻", "Observer 🍿"]
    }
]

export default function QuizPage() {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [matching, setMatching] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleAnswer = async (optionIndex: number) => {
        const newAnswers = [...answers, optionIndex]
        setAnswers(newAnswers)

        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            // Quiz Complete
            await finishQuiz(newAnswers)
        }
    }

    const finishQuiz = async (finalAnswers: number[]) => {
        setLoading(true)
        setMatching(true)

        try {
            // 1. Save Answers
            const { error } = await supabase.auth.updateUser({
                data: {
                    quiz_answers: finalAnswers,
                    onboarded: true
                },
            })

            if (error) throw error

            // 2. Fetch User Interests (needed for matching)
            const { data: { user } } = await supabase.auth.getUser()
            const interests = user?.user_metadata?.interests || []

            // 3. Find Best Room
            const roomId = await findBestRoom(user!.id, interests, finalAnswers)

            // 4. Join Room (Insert into room_members)
            if (roomId) {
                await supabase.from('room_members').insert({
                    room_id: roomId,
                    user_id: user!.id
                })

                // Slight delay for effect
                setTimeout(() => {
                    router.push(`/rooms/${roomId}`)
                }, 2000)
            } else {
                router.push('/dashboard') // Fallback
            }

        } catch (e) {
            console.error(e)
            setLoading(false)
        }
    }

    if (matching) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mb-6 mx-auto">
                        <Sparkles className="h-12 w-12 text-primary animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Analyzing your vibe...</h2>
                    <p className="text-muted-foreground">Finding the perfect crew for you.</p>
                </motion.div>
            </div>
        )
    }

    const question = QUESTIONS[currentStep]

    return (
        <div className="min-h-screen flex flex-col bg-background p-6">
            {/* Progress Bar */}
            <div className="w-full max-w-xl mx-auto mb-12 mt-8">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep) / QUESTIONS.length) * 100}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>
                <p className="text-right text-sm text-muted-foreground mt-2">
                    {currentStep + 1} / {QUESTIONS.length}
                </p>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center max-w-xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        <h1 className="text-3xl font-bold mb-8 text-center">{question.question}</h1>

                        <div className="space-y-4">
                            {question.options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleAnswer(index)}
                                    className="w-full p-4 text-left rounded-2xl border-2 border-muted bg-card hover:border-primary hover:bg-primary/5 transition-all duration-200 group flex items-center justify-between"
                                >
                                    <span className="text-lg font-medium">{option}</span>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    )
}
