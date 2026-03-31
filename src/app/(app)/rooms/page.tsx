'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { MessageSquare, Users, Sparkles, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { LoadingVibe } from '@/components/ui/LoadingVibe'

interface Room {
    id: string
    name: string
    category: string
    description: string
    tags: string[]
    member_count?: number
}

export default function RoomsHubPage() {
    const router = useRouter()
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [userInterests, setUserInterests] = useState<string[]>([])
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                // 1. Get User Data for Personalization
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase
                    .from('users')
                    .select('interests')
                    .eq('id', user.id)
                    .single()

                if (profile) setUserInterests(profile.interests || [])

                // 2. Fetch Rooms
                const { data: roomsData, error } = await supabase
                    .from('rooms')
                    .select('*')

                if (error) throw error

                // 3. Fetch member counts (Simplified for now)
                const roomsWithCount = await Promise.all((roomsData || []).map(async (room) => {
                    const { count } = await supabase
                        .from('room_members')
                        .select('*', { count: 'exact', head: true })
                        .eq('room_id', room.id)

                    return { ...room, member_count: count || 0 }
                }))

                setRooms(roomsWithCount)
            } catch (err) {
                console.error('Error fetching rooms:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchRooms()
    }, [supabase])

    // Sort rooms by interest overlap
    const sortedRooms = useMemo(() => {
        return [...rooms].sort((a, b) => {
            const aOverlap = a.tags?.filter(t => userInterests.includes(t)).length || 0
            const bOverlap = b.tags?.filter(t => userInterests.includes(t)).length || 0
            return bOverlap - aOverlap
        })
    }, [rooms, userInterests])

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

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
                            Vibe Rooms Hub 🏮
                        </h1>
                        <p className="text-gray-500 font-medium text-lg">Group chats for every subculture. Join a circle.</p>
                    </div>
                </header>

                {loading ? (
                    <LoadingVibe />
                ) : sortedRooms.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                        <Users className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700">No rooms active in your sector...</h3>
                        <p className="text-gray-500">Check back soon as new orbit sectors open up.</p>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {sortedRooms.map((room) => {
                            const overlapCount = room.tags?.filter(t => userInterests.includes(t)).length || 0

                            return (
                                <motion.div key={room.id} variants={item}>
                                    <Card className="h-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden flex flex-col relative border-t-4 border-t-indigo-500">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-[10px] uppercase font-black flex items-center gap-1">
                                                    <Hash className="w-3 h-3" /> {room.category || 'General'}
                                                </div>
                                                {overlapCount > 0 && (
                                                    <div className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                                                        <Sparkles className="w-3 h-3" /> Your Vibes
                                                    </div>
                                                )}
                                            </div>
                                            <CardTitle className="text-2xl font-black text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                                                {room.name}
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 font-medium">
                                                {room.description || "A space to vibe and talk about shared interests."}
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent className="space-y-4 flex flex-col flex-grow">
                                            <div className="flex flex-wrap gap-2">
                                                {room.tags?.map((tag, i) => (
                                                    <span
                                                        key={i}
                                                        className={cn(
                                                            "px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors",
                                                            userInterests.includes(tag)
                                                                ? "bg-indigo-600 text-white border-indigo-700"
                                                                : "bg-white/50 text-gray-500 border-gray-200"
                                                        )}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-white/20">
                                                <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                                                    <Users className="w-4 h-4" />
                                                    {room.member_count} active
                                                </div>
                                                <Button
                                                    onClick={() => router.push(`/rooms/${room.id}`)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-black px-6"
                                                >
                                                    Join Room
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
