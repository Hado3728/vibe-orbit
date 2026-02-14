'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, Orbit, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingVibe } from '@/components/ui/LoadingVibe'

interface UserProfile {
    id: string
    username: string
    age: number
    interests: string[]
    quiz_answers: number[]
}

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const [users, setUsers] = useState<(UserProfile & { matchScore: number, sharedInterest?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUsername, setCurrentUsername] = useState('')
    const [currentUserId, setCurrentUserId] = useState('')
    const [sentRequests, setSentRequests] = useState<string[]>([])
    const [requestingId, setRequestingId] = useState<string | null>(null)
    const supabase = createClient()

    // Helper: AI Match Logic
    const calculateMatch = (myAnswers: number[] | null, theirAnswers: number[] | null) => {
        if (!myAnswers || !theirAnswers || myAnswers.length === 0 || theirAnswers.length === 0) {
            return Math.floor(Math.random() * (95 - 70) + 70) // Fallback for legacy users
        }

        const length = Math.min(myAnswers.length, theirAnswers.length)
        let totalDiff = 0

        for (let i = 0; i < length; i++) {
            totalDiff += Math.abs(myAnswers[i] - theirAnswers[i])
        }

        // Logic: Lower diff is higher match. 
        // Assuming max diff per q is ~4 (1-5 scale), 8 questions => max diff 32.
        // Penalty factor 2.5 => 32 * 2.5 = 80. Min score 20%.
        const score = 100 - Math.round(totalDiff * 2.5)
        return Math.max(score, 10) // Min 10%
    }

    // Helper: Insight Logic
    const getInsight = (myInterests: string[] | null, theirInterests: string[] | null) => {
        if (!myInterests || !theirInterests) return "Similiar vibes ✨"
        const common = theirInterests.filter(i => myInterests.includes(i))
        if (common.length > 0) {
            // Pick random common interest
            const random = common[Math.floor(Math.random() * common.length)]
            return `AI Insight: You both love ${random}!`
        }
        return "AI Insight: Compatible energy patterns."
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Get Current User Auth
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                setCurrentUserId(user.id)

                // 2. Fetch Current User Profile (for Quiz/Interests)
                const { data: myProfile, error: myError } = await supabase
                    .from('users')
                    .select('username, interests, quiz_answers')
                    .eq('id', user.id)
                    .single()

                if (myError) throw myError
                setCurrentUsername(myProfile.username || 'Traveler')

                // 3. Fetch Other Users
                const { data: otherUsers, error } = await supabase
                    .from('users')
                    .select('id, username, age, interests, quiz_answers')
                    .neq('id', user.id)
                    .limit(20)

                if (error) throw error

                // 4. Process & Sort
                if (otherUsers) {
                    const processedUsers = otherUsers.map(u => ({
                        ...u,
                        matchScore: calculateMatch(myProfile.quiz_answers, u.quiz_answers),
                        sharedInterest: getInsight(myProfile.interests, u.interests)
                    })).sort((a, b) => b.matchScore - a.matchScore)

                    setUsers(processedUsers)
                }

                // 5. Fetch existing requests
                const { data: existingRequests } = await supabase
                    .from('connect_requests')
                    .select('to_user')
                    .eq('from_user', user.id)

                if (existingRequests) {
                    setSentRequests(existingRequests.map(r => r.to_user))
                }

            } catch (error) {
                console.error('Error fetching orbit:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [supabase])

    const handleSendRequest = async (receiverId: string) => {
        if (!currentUserId) return

        setRequestingId(receiverId)

        try {
            const { error } = await supabase
                .from('connect_requests')
                .insert({
                    from_user: currentUserId,
                    to_user: receiverId
                })

            if (error) throw error

            setSentRequests(prev => [...prev, receiverId])
        } catch (error: any) {
            alert("Failed to send request: " + error.message)
        } finally {
            setRequestingId(null)
        }
    }

    // Container Animation
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    }

    // Item Animation
    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                            Orbit 🪐
                        </h1>
                        <p className="text-gray-500 font-medium">Find your vibe. Sorted by compatibility.</p>
                    </div>
                </header>

                import {LoadingVibe} from '@/components/ui/LoadingVibe'

                // ... (inside component)
                {/* Content */}
                {loading ? (
                    <LoadingVibe />
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Orbit className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">It's quiet in orbit right now...</h3>
                        <p className="text-gray-500 max-w-sm">
                            You might be the first explorer here! Check back later for more people.
                        </p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {users.map((user) => {
                            const isRequested = sentRequests.includes(user.id)
                            const isRequesting = requestingId === user.id

                            return (
                                <motion.div key={user.id} variants={item}>
                                    <Card className="h-full bg-white/40 backdrop-blur-xl border-white/50 shadow-sm hover:shadow-md transition-all duration-300 group overflow-hidden flex flex-col relative">
                                        {/* Match Badge */}
                                        <div className="absolute top-4 right-4 z-10">
                                            <div className="bg-indigo-500/10 backdrop-blur-md border border-indigo-500/20 text-indigo-700 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm">
                                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                                {user.matchScore}% Match
                                            </div>
                                        </div>

                                        <CardHeader className="pb-3 pt-6">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                        {user.username}
                                                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                            {user.age}
                                                        </span>
                                                    </CardTitle>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-4 flex flex-col flex-grow">
                                            <div className="flex flex-wrap gap-2">
                                                {user.interests?.slice(0, 5).map((interest, i) => (
                                                    <span
                                                        key={i}
                                                        className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100"
                                                    >
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* AI Insight */}
                                            <div className="bg-purple-50/50 border border-purple-100 rounded-lg p-3 text-xs text-purple-800 italic flex items-start gap-2">
                                                <Sparkles className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                                {user.sharedInterest}
                                            </div>

                                            <div className="mt-auto pt-2">
                                                <Button
                                                    className={cn(
                                                        "w-full transition-all border shadow-sm",
                                                        isRequested
                                                            ? "bg-green-500 hover:bg-green-600 text-white border-green-600"
                                                            : "bg-white hover:bg-indigo-50 text-indigo-700 border-indigo-200 group-hover:border-indigo-300"
                                                    )}
                                                    onClick={() => handleSendRequest(user.id)}
                                                    disabled={isRequested || isRequesting}
                                                >
                                                    {isRequested ? (
                                                        <>
                                                            <Sparkles className="w-4 h-4 mr-2" />
                                                            Request Sent 🚀
                                                        </>
                                                    ) : isRequesting ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Sending...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <MessageCircle className="w-4 h-4 mr-2" />
                                                            Send Chat Request
                                                        </>
                                                    )}
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
