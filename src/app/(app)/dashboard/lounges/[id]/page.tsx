import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import LiveChat from '@/components/LiveChat'

export const dynamic = 'force-dynamic'

export default async function LoungeRoomPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // 1. Fetch current user to pass down ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return <div className="p-10 text-rose-500">Unauthorized. Please log in.</div>
    }

    // 2. Fetch Lounge Details
    const { data: lounge, error: loungeError } = await supabase
        .from('orbit_lounges')
        .select('*')
        .eq('id', params.id)
        .single()

    if (loungeError || !lounge) {
        notFound()
    }

    // 3. Fetch Initial Messages (Joined with user profiles)
    // Assuming messages have a `text` or `content` column. 
    // We get the last 50, ordered by creation (desc), then we flip them on the client.
    const { data: messages, error: messagesError } = await supabase
        .from('lounge_messages')
        .select(`
            *,
            users:user_id ( username, avatar_id )
        `)
        .eq('lounge_id', params.id)
        .order('created_at', { ascending: false })
        .limit(50)

    if (messagesError) {
        console.error("Error fetching messages:", messagesError)
    }

    // Flip so oldest is at the top of the array, newest at bottom.
    const initialMessages = messages ? messages.reverse() : []

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0a0a0a]">
            {/* Lounge Header */}
            <header className="shrink-0 p-6 border-b border-purple-900/30 bg-black/60 backdrop-blur-xl z-10 flex items-center justify-between shadow-2xl shadow-purple-900/5">
                <div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-indigo-300 flex items-center gap-3 tracking-tight">
                        {lounge.name}
                    </h1>
                    {lounge.description && (
                        <p className="text-xs font-medium text-purple-400/60 mt-1 uppercase tracking-widest">{lounge.description}</p>
                    )}
                </div>
            </header>

            {/* Real-time Sub Component */}
            <LiveChat 
                roomId={lounge.id} 
                initialMessages={initialMessages} 
                currentUserId={user.id} 
            />
        </div>
    )
}
