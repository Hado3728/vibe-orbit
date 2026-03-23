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
import OrbitReveal, { cardRevealItem } from '@/components/OrbitReveal'
import MatchCard from '@/components/MatchCard'

export default function DashboardPage() {
    const router = useRouter()
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUsername, setCurrentUsername] = useState('')
    const [currentUserId, setCurrentUserId] = useState('')
    const [sentRequests, setSentRequests] = useState<string[]>([])
    const [requestingId, setRequestingId] = useState<string | null>(null)
    const [nextDropTime, setNextDropTime] = useState<string | null>(null)
    const [isNewDrop, setIsNewDrop] = useState(false)
    
    // Memoised so the reference is stable and doesn't retrigger useEffect
    const supabase = useMemo(() => createClient(), [])

    // Helper: Insight Logic
    const getInsight = (myInterests: string[] | null, theirInterests: string[] | null) => {
        if (!myInterests || !theirInterests) return "Similiar vibes ✨"
        const common = theirInterests.filter(i => myInterests.includes(i))
        if (common.length > 0) {
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
                    router.replace('/login')
                    return
                }

                setCurrentUserId(user.id)

                // 2. Fetch Current User Profile 
                const { data: myProfile, error: myError } = await supabase
                    .from('users')
                    .select('username, interests, quiz_answers, last_orbit_drop')
                    .eq('id', user.id)
                    .single()

                if (myError) {
                    if (myError.code === 'PGRST116') {
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
                    await triggerOrbitDrop()
                    setNextDropTime(null)
                    setIsNewDrop(true)
                } else {
                    setNextDropTime(lastDropStr)
                    setIsNewDrop(false)
                }

                // 3. ALWAYS Fetch Users (Existing matches if <48, fresh drop if >=48)
                const { data: otherUsers, error } = await supabase
                    .from('users')
                    .select('id, username, age, interests, quiz_answers, avatar_id, icebreaker_answer')
                    .neq('id', user.id)
                    .limit(20)

                if (error) throw error

                // 4. Process & Filter by Quality Threshold
                if (otherUsers) {
                    const processedUsers = otherUsers
                        .map((u: any) => ({
                            ...u,
                            matchScore: calculateMatch(myProfile.quiz_answers, u.quiz_answers),
                            sharedInterest: getInsight(myProfile.interests, u.interests)
                        }))
                        .filter((u: any) => u.matchScore > 0)
                        .sort((a: any, b: any) => b.matchScore - a.matchScore)

                    setUsers(processedUsers)
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
                ) : users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center bg-black/40 backdrop-blur-md rounded-[2rem] border border-purple-900/30 shadow-xl mt-8">
                        <div className="h-20 w-20 bg-purple-900/20 rounded-full flex items-center justify-center animate-pulse mb-6">
                            <Orbit className="h-10 w-10 text-purple-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-200 mb-2">Searching the cosmos... 🌌</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            No active alignments fit your energy profile. 
                            Wait for the next drop or explore global lounges.
                        </p>
                        <Button
                            className="rounded-xl bg-purple-700 hover:bg-purple-600 text-purple-50 border-0"
                            onClick={() => router.push('/dashboard/lounges')}
                        >
                            Explore Lounges
                        </Button>
                    </div>
                ) : (
                    <OrbitReveal isNewDrop={isNewDrop}>
                        {users.map((user) => {
                            const isRequested = sentRequests.includes(user.id)
                            const isRequesting = requestingId === user.id

                            const btnContent = isRequested ? (
                                <><Sparkles className="w-4 h-4 mr-1" /> Request Sent</>
                            ) : isRequesting ? (
                                <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Transmitting...</>
                            ) : undefined;

                            const avatarUrl = user.avatar_id 
                                ? `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${user.avatar_id}&backgroundColor=transparent`
                                : undefined;

                            return (
                                <motion.div key={user.id} variants={cardRevealItem}>
                                    <MatchCard
                                        name={user.username || "Traveler"}
                                        matchScore={user.matchScore}
                                        sharedInterests={user.interests?.slice(0, 3) || []}
                                        bio={user.icebreaker_answer || user.sharedInterest || "Compatible energy patterns detected."}
                                        avatarUrl={avatarUrl}
                                        onAction={() => handleSendRequest(user.id)}
                                        isActionDisabled={isRequested || isRequesting}
                                        actionText={btnContent}
                                    />
                                </motion.div>
                            )
                        })}
                    </OrbitReveal>
                )}
            </div>
        </div>
    )
}
