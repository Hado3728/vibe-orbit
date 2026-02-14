'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sun } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AgePage() {
    const [age, setAge] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        const ageNum = parseInt(age)

        if (isNaN(ageNum)) {
            setError('Please enter a valid number.')
            setLoading(false)
            return
        }

        if (ageNum < 13) {
            setError('You must be at least 13 years old to join Orbit.')
            setLoading(false)
            return
        }

        if (ageNum > 19) {
            setError('Orbit is currently for teens (13-19).')
            setLoading(false)
            return
        }

        try {
            const { error: updateError } = await supabase.auth.updateUser({
                data: { age: ageNum, age_verified: true },
            })

            if (updateError) throw updateError

            router.push('/interests')
        } catch (e: any) {
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 -translate-x-1/2 translate-y-1/2" />

            <div className="w-full max-w-md space-y-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                >
                    <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center shadow-inner">
                        <Sun className="h-10 w-10 text-orange-500 animate-[spin_10s_linear_infinite]" />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <h1 className="text-3xl font-bold tracking-tight mb-2">One quick question...</h1>
                    <p className="text-muted-foreground text-lg">
                        How many trips around the sun have you made?
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    <div className="relative max-w-[120px] mx-auto">
                        <Input
                            type="number"
                            value={age}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAge(e.target.value)}
                            className="text-center text-4xl font-bold h-20 rounded-2xl border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-white/50 backdrop-blur-sm"
                            placeholder="16"
                            autoFocus
                        />
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-destructive font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20"
                            >
                                {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-14 text-lg rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all"
                        disabled={loading}
                    >
                        {loading ? 'Verifying...' : 'Continue'}
                    </Button>
                </motion.form>
            </div>
        </div>
    )
}
