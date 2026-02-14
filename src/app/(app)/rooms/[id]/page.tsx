'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatBubble } from '@/components/chat/ChatBubble'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Send, UserPlus, MoreVertical, Flag, Shield, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RoomPage() {
    const { id } = useParams()
    const supabase = createClient()
    const router = useRouter()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [room, setRoom] = useState<any>(null)
    const [messages, setMessages] = useState<any[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [members, setMembers] = useState<any[]>([])
    const [connectedUsers, setConnectedUsers] = useState<string[]>([])
    const [loading, setLoading] = useState(true)

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        const fetchRoomData = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            setCurrentUser(user)

            // 1. Fetch Room Details
            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', id)
                .single()

            if (roomError) {
                console.error('Room not found') // Handle 404 better in real app
                return
            }
            setRoom(roomData)

            // 2. Fetch Members
            const { data: memberData } = await supabase
                .from('room_members')
                .select('user_id, users(username, id)')
                .eq('room_id', id)

            if (memberData) {
                setMembers(memberData.map(m => m.users))
            }

            // 3. Fetch Existing Messages
            const { data: msgData } = await supabase
                .from('messages')
                .select('*, user:users(username)')
                .eq('room_id', id)
                .order('created_at', { ascending: true })

            if (msgData) setMessages(msgData)

            // 4. Fetch Connections (to show "Connected" status)
            const { data: connections } = await supabase
                .from('connect_requests')
                .select('*')
                .or(`from_user.eq.${user.id},to_user.eq.${user.id}`)
                .eq('status', 'accepted')

            if (connections) {
                const ids = connections.map(c => c.from_user === user.id ? c.to_user : c.from_user)
                setConnectedUsers(ids)
            }

            setLoading(false)
            scrollToBottom()
        }

        fetchRoomData()

        // 5. Subscribe to Realtime Messages
        const channel = supabase
            .channel(`room:${id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `room_id=eq.${id}`
            }, async (payload) => {
                // Fetch user details for the new message
                const { data: sender } = await supabase
                    .from('users')
                    .select('username')
                    .eq('id', payload.new.user_id)
                    .single()

                const newMsg = { ...payload.new, user: sender }
                setMessages(prev => [...prev, newMsg])
                scrollToBottom()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [id, router, supabase])

    const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUser) return

        const text = newMessage
        setNewMessage('') // Optimistic clear

        const { error } = await supabase
            .from('messages')
            .insert({
                room_id: id,
                user_id: currentUser.id,
                text: text
            })

        if (error) {
            console.error('Error sending message:', error)
            setNewMessage(text) // Revert on failure
        }
    }

    const handleConnect = async (targetUserId: string) => {
        try {
            // Check if they already requested us
            const { data: existing } = await supabase
                .from('connect_requests')
                .select('*')
                .eq('from_user', targetUserId)
                .eq('to_user', currentUser.id)
                .eq('status', 'pending')
                .single()

            if (existing) {
                // Accept Request
                await supabase
                    .from('connect_requests')
                    .update({ status: 'accepted' })
                    .eq('id', existing.id)

                alert("It's a Match! You can now DM each other.")
                setConnectedUsers(prev => [...prev, targetUserId])
            } else {
                // Send Request
                await supabase
                    .from('connect_requests')
                    .insert({
                        from_user: currentUser.id,
                        to_user: targetUserId,
                        status: 'pending'
                    })

                alert("Connect request sent!")
            }
        } catch (e) {
            console.error(e)
        }
    }

    if (loading) return <div className="flex h-screen items-center justify-center">Loading Room...</div>

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            {/* Sidebar (Members) - Hidden on mobile, toggleable? For now inline on right or left */}
            <div className="hidden md:flex flex-col w-64 bg-card border-r border-border p-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="h-5 w-5 text-primary" />
                    <h2 className="font-bold text-lg">{room?.name}</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Members ({members.length})</h3>
                    {members.map(member => (
                        <div key={member.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors group">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{member.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm font-medium truncat w-24">{member.username}</span>
                            </div>

                            {member.id !== currentUser.id && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleConnect(member.id)}
                                    title={connectedUsers.includes(member.id) ? "Connected" : "Connect"}
                                    disabled={connectedUsers.includes(member.id)}
                                >
                                    {connectedUsers.includes(member.id) ? (
                                        <div className="h-2 w-2 bg-green-500 rounded-full" />
                                    ) : (
                                        <UserPlus className="h-4 w-4 text-muted-foreground hover:text-primary" />
                                    )}
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative w-full">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
                    <h1 className="font-bold">{room?.name}</h1>
                    <Button size="icon" variant="ghost"><Info className="h-5 w-5" /></Button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
                    <div className="text-center text-xs text-muted-foreground my-4">
                        This is the start of your encrypted vibe session.
                    </div>

                    {messages.map((msg) => (
                        <ChatBubble
                            key={msg.id}
                            message={msg}
                            isCurrentUser={msg.user_id === currentUser?.id}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-card border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex gap-2 max-w-4xl mx-auto">
                        <Input
                            value={newMessage}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full bg-muted border-transparent focus:bg-background transition-all"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            className="rounded-full h-10 w-10 shrink-0 shadow-md hover:shadow-lg transition-shadow"
                            disabled={!newMessage.trim()}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
