'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { ReportModal } from '@/components/chat/ReportModal'
import { cn } from '@/lib/utils'

interface ChatBubbleProps {
    message: {
        id: number
        text: string
        user_id: string
        created_at: string
        user?: {
            username: string
        }
    }
    isCurrentUser: boolean
}

export function ChatBubble({ message, isCurrentUser }: ChatBubbleProps) {
    return (
        <div className={cn("flex gap-3 max-w-[80%]", isCurrentUser ? "ml-auto flex-row-reverse" : "")}>
            <Avatar className="h-8 w-8">
                <AvatarFallback className={cn("text-xs", isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted")}>
                    {message.user?.username?.slice(0, 2).toUpperCase() || '??'}
                </AvatarFallback>
            </Avatar>

            <div className={cn(
                "group relative px-4 py-2 rounded-2xl text-sm",
                isCurrentUser
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-white border border-border rounded-tl-sm shadow-sm"
            )}>
                <p>{message.text}</p>

                {/* Timestamp */}
                <span className={cn(
                    "text-[10px] mt-1 block opacity-70",
                    isCurrentUser ? "text-primary-foreground" : "text-muted-foreground"
                )}>
                    {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>

                {/* Report Button (Only for others) */}
                {!isCurrentUser && (
                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ReportModal
                            messageId={message.id}
                            reportedUserId={message.user_id}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
