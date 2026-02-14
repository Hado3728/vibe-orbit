'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { generateUsername } from '@/lib/generateUsername'
import { ArrowRight, Check, Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// Types
type Step = 1 | 2 | 3 | 4

const INTEREST_TAGS = [
    'Coding', 'Gaming', 'Anime', 'Music', 'Art', 'Sports',
    'Reading', 'Movies', 'Late Night Chats', 'Study Grinds', 'Memes', 'Photography'
]

const QUIZ_QUESTIONS = [
    {
        id: 1,
        question: "Background noise preference?",
        options: ["Silence", "Lofi", "High-energy", "Streams"]
    },
    {
        id: 2,
        question: "Group chat personality?",
        options: ["The Planner", "The Memer", "The Lurker", "The Deep Talker"]
    },
    {
        id: 3,
        question: "Weekly aesthetic?",
        options: ["Minimalist", "Chaos", "Cozy", "Grind-mode"]
    },
    {
        id: 4,
        question: "Small talk opinion?",
        options: ["Love it", "Hate it", "Shy at first", "Listener"]
    },
    {
        id: 5,
        question: "Ideal room vibe?",
        options: ["Late Night", "Study", "Hype/Gaming", "Creative"]
    },
    {
        id: 6,
        question: "Night Owl status?",
        options: ["Asleep by 10", "Midnight", "2 AM", "Sleep is a myth"]
    },
    {
        id: 7,
        question: "Texting style?",
        options: ["Dry/Fast", "Keyboard smasher", "Voice notes", "Paragraphs"]
    },
    {
        id: 8,
        question: "Conflict style?",
        options: ["Mediator", "Observer", "Arguer", "Ghoster"]
    }
]

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()

    // State
    const [step, setStep] = useState<Step>(1)
    const [age, setAge] = useState<string>('')
    const [interests, setInterests] = useState<string[]>([])
    const [quizAnswers, setQuizAnswers] = useState<number[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Derived State
    const currentQuestionIndex = quizAnswers.length

    // Handlers
    const handleNext = () => {
        if (step === 1) {
            const ageNum = parseInt(age)
            if (isNaN(ageNum) || ageNum < 13 || ageNum > 19) {
                setError("Orbit is exclusively for ages 13-19 right now!")
                return
            }
            setError('')
            setStep(2)
        } else if (step === 2) {
            if (interests.length < 3) {
                setError("Pick at least 3 vibes to continue!")
                return
            }
            setError('')
            setStep(3)
        }
    }

    const toggleInterest = (tag: string) => {
        setInterests(prev =>
            prev.includes(tag)
                ? prev.filter(i => i !== tag)
                : [...prev, tag]
        )
    }

    const handleQuizAnswer = (optionIndex: number) => {
        const newAnswers = [...quizAnswers, optionIndex]
        setQuizAnswers(newAnswers)

        if (newAnswers.length === QUIZ_QUESTIONS.length) {
            submitProfile(newAnswers)
        }
    }

    const submitProfile = async (finalAnswers: number[]) => {
        setStep(4)
        setLoading(true)

        try {
            const username = generateUsername()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) throw new Error("No authenticated user found")

            // 1. Update Auth Metadata
            const { error: authError } = await supabase.auth.updateUser({
                data: {
                    onboarded: true,
                    age_verified: true,
                    username
                }
            })
            if (authError) throw authError

            // 2. Upsert to public.users
            const { error: dbError } = await supabase.from('users').upsert({
                id: user.id,
                username,
                age: parseInt(age),
                interests,
                quiz_answers: finalAnswers,
                created_at: new Date().toISOString()
            })
            if (dbError) throw dbError

            router.push('/dashboard')
        } catch (e: any) {
            setError(e.message)
            setStep(3) // Go back to quiz if fail
            setQuizAnswers([]) // Reset quiz to try again? Or maybe just keep answers. 
            // Resetting might be annoying. Let's just keep them but allow retrying submission.
            // Actually, for simplicity in this flow, if it fails, we show error on step 4 or go back.
            // Let's stay on step 4 but show error text.
        }
    }

    // Animation Variants
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0
        })
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 overflow-hidden">
            <Card className="w-full max-w-lg bg-white/40 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl overflow-hidden relative">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <Sparkles className="h-5 w-5 text-indigo-500" />
                        {step === 4 ? "Analyzing Vibes..." : `Step ${step} of 3`}
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-6 h-[400px] relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col justify-between"
                            >
                                <div className="space-y-6 pt-10">
                                    <h2 className="text-3xl font-bold text-center text-gray-800">
                                        How many trips around the sun? ☀️
                                    </h2>
                                    <div className="flex justify-center">
                                        <Input
                                            type="number"
                                            value={age}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
                                            placeholder="16"
                                            className="text-center text-5xl h-24 w-40 rounded-2xl bg-white/50 border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-indigo-600"
                                            autoFocus
                                        />
                                    </div>
                                    {error && <p className="text-center text-red-500 font-medium animate-pulse">{error}</p>}
                                </div>
                                <Button
                                    onClick={handleNext}
                                    className="w-full h-12 rounded-xl text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                                >
                                    Next <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="h-full flex flex-col justify-between"
                            >
                                <div className="space-y-4">
                                    <h2 className="text-2xl font-bold text-center text-gray-800">
                                        What's your vibe?
                                        <span className="block text-sm font-normal text-gray-500 mt-1">Pick at least 3</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                        {INTEREST_TAGS.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleInterest(tag)}
                                                className={cn(
                                                    "px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border",
                                                    interests.includes(tag)
                                                        ? "bg-indigo-500 text-white border-indigo-500 shadow-md transform scale-[1.02]"
                                                        : "bg-white/50 text-gray-600 border-white/50 hover:bg-white hover:shadow-sm"
                                                )}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                    {error && <p className="text-center text-red-500 font-medium text-sm">{error}</p>}
                                </div>
                                <Button
                                    onClick={handleNext}
                                    className="w-full h-12 rounded-xl text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
                                >
                                    Continue ({interests.length}) <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key={`question-${currentQuestionIndex}`}
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="h-full flex flex-col justify-between"
                            >
                                {currentQuestionIndex < QUIZ_QUESTIONS.length ? (
                                    <>
                                        <div className="space-y-6 pt-4">
                                            <div className="flex justify-between items-center px-2">
                                                <span className="text-xs font-bold text-indigo-500 tracking-wider uppercase">
                                                    Question {currentQuestionIndex + 1}/{QUIZ_QUESTIONS.length}
                                                </span>
                                                <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-indigo-500 transition-all duration-500"
                                                        style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <h2 className="text-2xl font-bold text-center text-gray-800 px-4">
                                                {QUIZ_QUESTIONS[currentQuestionIndex].question}
                                            </h2>

                                            <div className="grid grid-cols-1 gap-3">
                                                {QUIZ_QUESTIONS[currentQuestionIndex].options.map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleQuizAnswer(idx)}
                                                        className="w-full p-4 rounded-xl bg-white/60 hover:bg-white border border-white/60 hover:border-indigo-200 text-left font-medium text-gray-700 transition-all hover:shadow-md active:scale-[0.99] group"
                                                    >
                                                        <span className="inline-block w-6 text-indigo-400 group-hover:text-indigo-600 font-bold">{idx + 1}.</span> {option}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="h-full flex flex-col items-center justify-center text-center space-y-6"
                            >
                                <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center animate-pulse">
                                    <Sparkles className="h-10 w-10 text-indigo-600" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-800">Finding your orbit...</h2>
                                    <p className="text-gray-500">Matching you with people who pass the vibe check.</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </div>
    )
}
