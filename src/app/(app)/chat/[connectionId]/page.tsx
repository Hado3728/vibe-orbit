'use client'

export const dynamic = 'force-dynamic';

import { useEffect, useState, useRef, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Message {
    id: number
    room_id: string
    user_id: string
    text: string
    timestamp: string
}

interface ChatPageProps {
    params: Promise<{ connectionId: string }>
}

export default function ChatPage({ params }: ChatPageProps) {
    const { connectionId } = use(params)
    const router = useRouter()

    // Guard against server-side rendering of browser-only code
    if (typeof window === 'undefined') return null;

    // State
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom helper
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        const supabase = createClient()
        const setupChat = async () => {
            try {
                // 1. Get Current User
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    router.push('/login')
                    return
                }
                setCurrentUserId(user.id)

                // 2. Fetch Existing Messages
                // ADAPTATION: Mapping connectionId to room_id from schema
                const { data: existingMessages, error } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('room_id', connectionId)
                    .order('timestamp', { ascending: true })

                if (error) throw error

                if (existingMessages) {
                    setMessages(existingMessages)
                }

                // 3. Real-time Subscription
                const channel = supabase
                    .channel(`chat:${connectionId}`)
                    .on('postgres_changes',
                        {
                            event: 'INSERT',
                            schema: 'public',
                            table: 'messages',
                            filter: `room_id=eq.${connectionId}`
                        },
                        (payload: { new: Message }) => {
                            setMessages((prev) => [...prev, payload.new as Message])
                        }
                    )
                    .subscribe()

                return () => {
                    supabase.removeChannel(channel)
                }

            } catch (error) {
                console.error('Error setting up chat:', error)
            } finally {
                setLoading(false)
            }
        }

        setupChat()
    }, [connectionId, router])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !currentUserId) return

        try {
            const text = newMessage.trim()
            setNewMessage('') // Optimistic clear

            const { error } = await createClient()
                .from('messages')
                .insert({
                    room_id: connectionId,
                    user_id: currentUserId,
                    text: text
                })

            if (error) throw error

            // Note: Subscription will handle adding to state
        } catch (error) {
            console.error('Error sending message:', error)
            alert('Failed to send message')
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
            {/* Header */}
            <header className="flex-none p-4 backdrop-blur-md bg-white/60 border-b border-indigo-100 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="md:hidden">
                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                </Button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        Live Orbit Chat 💬
                    </h1>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Online
                    </p>
                </div>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                        <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Send className="h-6 w-6 text-indigo-400" />
                        </div>
                        <p className="text-sm font-medium text-gray-500">No messages yet. Say hi!</p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => {
                            const isMe = msg.user_id === currentUserId
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={cn(
                                        "flex w-full",
                                        isMe ? "justify-end" : "justify-start"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "max-w-[75%] md:max-w-[60%] px-4 py-2 rounded-2xl text-sm shadow-sm",
                                            isMe
                                                ? "bg-indigo-600 text-white rounded-br-none"
                                                : "bg-white border border-indigo-100 text-gray-800 rounded-bl-none"
                                        )}
                                    >
                                        <p>{msg.text}</p>
                                        <p className={cn(
                                            "text-[10px] mt-1 text-right",
                                            isMe ? "text-indigo-200" : "text-gray-400"
                                        )}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="flex-none p-4 bg-white/70 backdrop-blur-md border-t border-indigo-100">
                <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative flex items-center gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-white border-indigo-200 focus:border-indigo-400 focus:ring-indigo-200 rounded-full h-12 pl-6 pr-12 shadow-sm"
                    />
                    <Button
                        type="submit"
                        size="icon"
                        className="absolute right-2 top-1.5 h-9 w-9 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white shadow-md transition-transform active:scale-95"
                        disabled={!newMessage.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
            </div>
        </div>
    )
}
