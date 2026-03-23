'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Loader2, Sparkles, Orbit, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LoadingVibe } from '@/components/ui/LoadingVibe'
import { calculateMatch, UserProfile } from '@/lib/matching'
import OrbitTimer from '@/components/OrbitTimer'
import { triggerOrbitDrop } from './actions'

export default function DashboardPage() {
    const router = useRouter()
    const [users, setUsers] = useState<(UserProfile & { matchScore: number, sharedInterest?: string })[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUsername, setCurrentUsername] = useState('')
    const [currentUserId, setCurrentUserId] = useState('')
    const [sentRequests, setSentRequests] = useState<string[]>([])
    const [requestingId, setRequestingId] = useState<string | null>(null)
    const [nextDropTime, setNextDropTime] = useState<string | null>(null)
    // Memoised so the reference is stable and doesn't retrigger useEffect
    const supabase = useMemo(() => createClient(), [])

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
                const { data: { user }, error: authError } = await supabase.auth.getUser()
                if (authError || !user) {
                    // No valid session — bounce to login cleanly instead of crashing
                    router.replace('/login')
                    return
                }

                setCurrentUserId(user.id)

                // 2. Fetch Current User Profile (for Quiz/Interests)
                const { data: myProfile, error: myError } = await supabase
                    .from('users')
                    .select('username, interests, quiz_answers, last_orbit_drop')
                    .eq('id', user.id)
                    .single()

                if (myError) {
                    if (myError.code === 'PGRST116') {
                        // User exists in Auth but not in our public.users table yet
                        router.replace('/onboarding')
                        return
                    }
                    throw myError
                }
                setCurrentUsername(myProfile.username || 'Traveler')

                // The 48-Hour Orbit Drop Logic Check
                const now = new Date().getTime();
                const lastDropStr = myProfile.last_orbit_drop;
                const lastDrop = lastDropStr ? new Date(lastDropStr).getTime() : 0;
                const hoursSinceDrop = (now - lastDrop) / (1000 * 60 * 60);

                if (hoursSinceDrop >= 48) {
                    // Update the drop time on the server
                    await triggerOrbitDrop()
                    setNextDropTime(null)

                    // 3. Fetch Other Users
                    const { data: otherUsers, error } = await supabase
                        .from('users')
                        .select('id, username, age, interests, quiz_answers')
                        .neq('id', user.id)
                        .limit(20)

                    if (error) throw error

                    // 4. Process & Filter by Quality Threshold
                    if (otherUsers) {
                        const processedUsers = otherUsers
                            .map((u: UserProfile) => ({
                                ...u,
                                matchScore: calculateMatch(myProfile.quiz_answers, u.quiz_answers),
                                sharedInterest: getInsight(myProfile.interests, u.interests)
                            }))
                            // Enforce the strict threshold (calculateMatch returns 0 if < 65)
                            .filter((u: any) => u.matchScore > 0)
                            .sort((a: any, b: any) => b.matchScore - a.matchScore)

                        setUsers(processedUsers)
                    }
                } else {
                    // Less than 48 hours. Set the timer and hide new match potentials!
                    setNextDropTime(lastDropStr)
                }

                // 5. Fetch existing requests
                const { data: existingRequests } = await supabase
                    .from('connect_requests')
                    .select('to_user')
                    .eq('from_user', user.id)

                if (existingRequests) {
                    setSentRequests(existingRequests.map((r: { to_user: string }) => r.to_user))
                }

            } catch (error) {
                console.error('Error fetching orbit:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [supabase, router])

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
        <div className="min-h-screen bg-transparent p-4 md:p-8">
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


                {/* Content */}
                {nextDropTime && (
                    <div className="mb-12">
                        <OrbitTimer lastOrbitDrop={nextDropTime} />
                    </div>
                )}
                
                {loading ? (
                    <LoadingVibe />
                ) : nextDropTime && users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center mt-8 space-y-4">
                        <Orbit className="h-12 w-12 text-slate-400 animate-spin" />
                        <h3 className="text-xl font-bold text-gray-500">Anticipate the influx. No matches to display right now.</h3>
                    </div>
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 space-y-6 text-center bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl">
                        <div className="h-20 w-20 bg-indigo-500/10 rounded-full flex items-center justify-center animate-pulse">
                            <Orbit className="h-10 w-10 text-indigo-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-gray-800">Searching the cosmos... 🌌</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                No direct binary matches fit your energy profile right now.
                                We only show matches above a 65% compatibility score to ensure high-quality vibes.
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl border-indigo-200 hover:bg-indigo-50"
                            onClick={() => router.push('/rooms')}
                        >
                            Explore Vibe Rooms instead
                        </Button>
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
