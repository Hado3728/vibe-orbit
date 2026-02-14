'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { Loader2, MessageSquare, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
    id: string
    username: string
    age: number
    interests: string[]
}

interface Conversation {
    connectionId: string
    otherUser: UserProfile
    lastMessage?: string // Future enhancement
}

export default function ChatInboxPage() {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    // Guard against server-side rendering of browser-only code
    if (typeof window === 'undefined') return null;

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                // 1. Get Current User
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // 2. Fetch Accepted Connections
                const { data: connections, error: connError } = await supabase
                    .from('connect_requests')
                    .select('id, from_user, to_user, status')
                    .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
                    .eq('status', 'accepted')
                    .order('created_at', { ascending: false })

                if (connError) throw connError

                if (!connections || connections.length === 0) {
                    setLoading(false)
                    return
                }

                // 3. Identify "Other" User IDs
                const otherUserIds = connections.map(c =>
                    c.from_user === user.id ? c.to_user : c.from_user
                )

                // 4. Fetch Profiles
                const { data: users, error: userError } = await supabase
                    .from('users')
                    .select('id, username, age, interests')
                    .in('id', otherUserIds)

                if (userError) throw userError

                // 5. Merge Data
                const mappedConversations = connections.map(conn => {
                    const otherId = conn.from_user === user.id ? conn.to_user : conn.from_user
                    const otherUser = users?.find(u => u.id === otherId)

                    if (!otherUser) return null

                    return {
                        connectionId: conn.id,
                        otherUser
                    }
                }).filter(Boolean) as Conversation[]

                setConversations(mappedConversations)

            } catch (error) {
                console.error('Error fetching chats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchConversations()
    }, [supabase])

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
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <header className="flex flex-col gap-1">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                        Your Orbits 💬
                    </h1>
                    <p className="text-gray-500 font-medium">Active conversations.</p>
                </header>

                {/* Content */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                        <p className="text-gray-500 animate-pulse">Loading conversations...</p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <MessageSquare className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700">No active chats yet.</h3>
                        <p className="text-gray-500 max-w-sm">
                            Go to the <Link href="/dashboard" className="text-indigo-600 underline">Orbit feed</Link> to find people!
                        </p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        {conversations.map((chat) => (
                            <motion.div key={chat.connectionId} variants={item}>
                                <Card className="hover:shadow-lg transition-shadow duration-300 bg-white/60 backdrop-blur-md border-white/50">
                                    <CardContent className="p-0">
                                        <div className="flex items-center justify-between p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                    {chat.otherUser.username.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                                        {chat.otherUser.username}
                                                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100">
                                                            {chat.otherUser.age}
                                                        </span>
                                                    </h3>
                                                    <div className="flex gap-2 mt-1">
                                                        {chat.otherUser.interests.slice(0, 3).map((tag, i) => (
                                                            <span key={i} className="text-xs text-gray-500">#{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <Link href={`/chat/${chat.connectionId}`}>
                                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6 shadow-md transition-all active:scale-95">
                                                    Message
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
