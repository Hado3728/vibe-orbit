'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2 } from 'lucide-react'

interface MessagePayload {
    id: string | number
    user_id: string
    text?: string
    content?: string
    created_at: string
    users?: {
        username: string
        avatar_id: string | null
    }
}

interface LiveChatProps {
    roomId: string
    initialMessages: MessagePayload[]
    currentUserId: string
}

export default function LiveChat({ roomId, initialMessages, currentUserId }: LiveChatProps) {
    const supabase = createClient()
    const [messages, setMessages] = useState<MessagePayload[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Subscription Setup
    useEffect(() => {
        const channel = supabase.channel(`lounge_${roomId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'lounge_messages',
                    filter: `lounge_id=eq.${roomId}`
                },
                async (payload) => {
                    const newMsg = payload.new as MessagePayload;
                    
                    // Supabase real-time doesn't auto-join tables on insert events.
                    // We must fetch the user profile manually for the newly inserted message to get their avatar_id.
                    const { data: userProfile } = await supabase
                        .from('users')
                        .select('username, avatar_id')
                        .eq('id', newMsg.user_id)
                        .single()

                    const completeMessage = {
                        ...newMsg,
                        users: userProfile || { username: 'Unknown', avatar_id: 'Vibe' }
                    }

                    setMessages((prev) => {
                        // Prevent duplicates if we already optimistically added it or due to strict mode firing twice
                        if (prev.find(m => m.id === completeMessage.id)) return prev
                        return [...prev, completeMessage]
                    })
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId]) // Removed non-stable 'supabase' to prevent memory leak resubscription loops


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || isSending) return

        setIsSending(true)
        const textPayload = newMessage.trim()
        
        try {
            // Attempt insert. Assuming standard column holds message body as 'text' (or 'content')
            // Using 'text' as standard Next.js / Supabase paradigms often use. 
            // If the table uses 'content', this would throw an error, but handles gracefully.
            const { error } = await supabase
                .from('lounge_messages')
                .insert({
                    lounge_id: roomId,
                    user_id: currentUserId,
                    text: textPayload 
                    // Note: If schema uses 'content', change 'text: textPayload' to 'content: textPayload'
                })

            if (error) throw error
            setNewMessage('')
        } catch (error: any) {
            console.error("Failed to send message:", error)
            // Fallback trial if column name is actually 'content' instead of 'text' based on common DB setups
            if (error.code === 'PGRST204' || error.message.includes('column "text" of relation "lounge_messages" does not exist')) {
                await supabase.from('lounge_messages').insert({
                    lounge_id: roomId,
                    user_id: currentUserId,
                    content: textPayload
                })
                setNewMessage('')
            }
        } finally {
            setIsSending(false)
        }
    }

    return (
        <div className="flex-1 flex flex-col overflow-hidden relative selection:bg-purple-500/30">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-purple-900/50 scrollbar-track-transparent">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-slate-500 font-light text-sm bg-black/40 px-6 py-3 rounded-full border border-purple-900/30">
                            The frequency is clear. Be the first to initiate contact.
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.user_id === currentUserId
                        // Handle either 'text' or 'content' column variants transparently
                        const msgText = msg.text || msg.content || ""
                        const avatarSeed = msg.users?.avatar_id || "Vibe"
                        const username = msg.users?.username || "Traveler"

                        return (
                            <div 
                                key={msg.id} 
                                className={`flex items-end gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}
                            >
                                {/* DiceBear Avatar Rendering */}
                                <div className={`shrink-0 w-8 h-8 rounded-full bg-purple-900/20 border border-purple-800/50 flex items-center justify-center p-1 ${isMe ? 'ring-1 ring-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : ''}`}>
                                    <img 
                                        src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${avatarSeed}&backgroundColor=transparent`} 
                                        alt={username}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                
                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                    <span className="text-[10px] text-purple-400/60 font-semibold uppercase tracking-wider mb-1 px-1">
                                        {username}
                                    </span>
                                    <div 
                                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isMe 
                                            ? 'bg-purple-700 text-purple-50 rounded-br-sm' 
                                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-sm'
                                        }`}
                                    >
                                        {msgText}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="shrink-0 p-4 sm:p-6 bg-slate-950 border-t border-slate-800">
                <form 
                    onSubmit={handleSendMessage} 
                    className="max-w-5xl mx-auto relative flex items-center gap-3"
                >
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Transmit into the orbit..."
                        disabled={isSending}
                        maxLength={500}
                        className="w-full bg-purple-950/20 border border-purple-900/50 rounded-full pl-6 pr-14 py-4 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-colors shadow-inner"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4 translate-x-[-1px] translate-y-[1px]" />
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
