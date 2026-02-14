'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Loader2, Check, X, Radar } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserProfile {
    id: string
    username: string
    age: number
    interests: string[]
}

interface RequestWithSender {
    id: string // connection request id
    sender: UserProfile
    timestamp: string
}

export const dynamic = 'force-dynamic';

export default function RequestsPage() {
    const [requests, setRequests] = useState<RequestWithSender[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                // 1. Get Current User
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // 2. Fetch Pending Requests
                // We'll fetch the requests first, then the user profiles
                // This avoids complex join syntax guessing and is safer
                const { data: pendingRequests, error: reqError } = await supabase
                    .from('connect_requests')
                    .select('id, from_user, created_at')
                    .eq('to_user', user.id)
                    .eq('status', 'pending')
                    .order('created_at', { ascending: false })

                if (reqError) throw reqError

                if (!pendingRequests || pendingRequests.length === 0) {
                    setLoading(false)
                    return
                }

                // 3. Fetch Senders
                const senderIds = pendingRequests.map(r => r.from_user)
                const { data: senders, error: userError } = await supabase
                    .from('users')
                    .select('id, username, age, interests')
                    .in('id', senderIds)

                if (userError) throw userError

                // 4. Merge Data
                const mergedRequests = pendingRequests.map(req => {
                    const sender = senders?.find(u => u.id === req.from_user)
                    if (!sender) return null
                    return {
                        id: req.id,
                        sender,
                        timestamp: req.created_at
                    }
                }).filter(Boolean) as RequestWithSender[]

                setRequests(mergedRequests)

            } catch (error) {
                console.error('Error fetching requests:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchRequests()
    }, [supabase])

    const handleAction = async (requestId: string, action: 'accepted' | 'rejected') => {
        setProcessingId(requestId)
        try {
            const { error } = await supabase
                .from('connect_requests')
                .update({ status: action })
                .eq('id', requestId)

            if (error) throw error

            // Remove from local state
            setRequests(prev => prev.filter(r => r.id !== requestId))

            // Optional: If accepted, maybe create a room? That's next task.
            if (action === 'accepted') {
                // Future: Create room logic here or trigger a server action
            }

        } catch (error: any) {
            alert(`Failed to ${action} request: ` + error.message)
        } finally {
            setProcessingId(null)
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
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        Incoming Vibes 📡
                    </h1>
                    <p className="text-gray-500 font-medium">People who want to chat.</p>
                </header>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-gray-500 animate-pulse">Checking your radar...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Radar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">No pending requests.</h3>
                        <p className="text-gray-500 max-w-sm">
                            It's peaceful out here. Check the feed to find someone new!
                        </p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {requests.map((req) => (
                            <motion.div key={req.id} variants={item}>
                                <Card className="h-full bg-white/40 backdrop-blur-xl border-white/50 shadow-xl rounded-3xl overflow-hidden flex flex-col">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                                    {req.sender.username}
                                                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                        {req.sender.age}
                                                    </span>
                                                </CardTitle>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Sent {new Date(req.timestamp).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-bl from-green-400 to-blue-400 opacity-20" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 flex-grow">
                                        <div className="flex flex-wrap gap-2">
                                            {req.sender.interests?.slice(0, 5).map((interest, i) => (
                                                <span
                                                    key={i}
                                                    className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100"
                                                >
                                                    {interest}
                                                </span>
                                            ))}
                                            {(req.sender.interests?.length || 0) > 5 && (
                                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-500 border border-gray-100">
                                                    +{req.sender.interests.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    </CardContent>
                                    <CardFooter className="gap-2 pt-2">
                                        <Button
                                            className="flex-1 bg-white hover:bg-green-50 text-green-600 border border-green-200 hover:border-green-300"
                                            onClick={() => handleAction(req.id, 'accepted')}
                                            disabled={processingId === req.id}
                                        >
                                            {processingId === req.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="w-4 h-4 mr-2" />
                                                    Accept
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300"
                                            onClick={() => handleAction(req.id, 'rejected')}
                                            disabled={processingId === req.id}
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Reject
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
