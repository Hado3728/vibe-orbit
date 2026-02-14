'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Code, Gamepad2, Music, Palette, BookOpen, Coffee, Camera, Globe, Headphones, Mic, PenTool, Dumbbell } from 'lucide-react'
import clsx from 'clsx'

const INTERESTS = [
    { id: 'gaming', label: 'Gaming', icon: Gamepad2, color: 'bg-indigo-100 text-indigo-600 border-indigo-200' },
    { id: 'coding', label: 'Coding', icon: Code, color: 'bg-slate-100 text-slate-800 border-slate-200' },
    { id: 'music', label: 'Music', icon: Music, color: 'bg-rose-100 text-rose-600 border-rose-200' },
    { id: 'art', label: 'Art', icon: Palette, color: 'bg-purple-100 text-purple-600 border-purple-200' },
    { id: 'reading', label: 'Reading', icon: BookOpen, color: 'bg-amber-100 text-amber-700 border-amber-200' },
    { id: 'cooking', label: 'Cooking', icon: Coffee, color: 'bg-orange-100 text-orange-600 border-orange-200' },
    { id: 'photography', label: 'Photography', icon: Camera, color: 'bg-sky-100 text-sky-600 border-sky-200' },
    { id: 'travel', label: 'Travel', icon: Globe, color: 'bg-emerald-100 text-emerald-600 border-emerald-200' },
    { id: 'podcasts', label: 'Podcasts', icon: Headphones, color: 'bg-teal-100 text-teal-600 border-teal-200' },
    { id: 'singing', label: 'Singing', icon: Mic, color: 'bg-pink-100 text-pink-600 border-pink-200' },
    { id: 'writing', label: 'Writing', icon: PenTool, color: 'bg-stone-100 text-stone-600 border-stone-200' },
    { id: 'fitness', label: 'Fitness', icon: Dumbbell, color: 'bg-lime-100 text-lime-700 border-lime-200' },
]

export default function InterestsPage() {
    const [selected, setSelected] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const toggleInterest = (id: string) => {
        if (selected.includes(id)) {
            setSelected(selected.filter(i => i !== id))
        } else {
            if (selected.length < 5) {
                setSelected([...selected, id])
            }
        }
    }

    const handleSubmit = async () => {
        if (selected.length === 0) return
        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                data: { interests: selected },
            })

            if (error) throw error

            router.push('/quiz')
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <div className="w-full max-w-4xl space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold">What are you into?</h1>
                    <p className="text-muted-foreground">Pick up to 5 interests to help us match you.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {INTERESTS.map((interest, index) => {
                        const isSelected = selected.includes(interest.id)
                        const Icon = interest.icon

                        return (
                            <motion.button
                                key={interest.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => toggleInterest(interest.id)}
                                className={clsx(
                                    "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300",
                                    interest.color,
                                    isSelected
                                        ? "ring-4 ring-offset-2 ring-primary border-transparent scale-105 shadow-lg"
                                        : "hover:scale-105 hover:shadow-md border-transparent bg-opacity-50 hover:bg-opacity-80"
                                )}
                            >
                                <Icon className="h-8 w-8 mb-3" />
                                <span className="font-semibold">{interest.label}</span>
                            </motion.button>
                        )
                    })}
                </div>

                <div className="flex justify-center pt-8">
                    <Button
                        size="lg"
                        onClick={handleSubmit}
                        disabled={selected.length === 0 || loading}
                        className="w-full max-w-sm h-14 text-lg rounded-xl transition-all"
                    >
                        {loading ? 'Saving...' : `Continue ${selected.length > 0 ? `(${selected.length}/5)` : ''}`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
