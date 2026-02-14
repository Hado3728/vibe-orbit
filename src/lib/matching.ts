import { createClient } from '@/lib/supabase/client'

interface Room {
    id: string
    name: string
    tags: string[]
}

// Simple scoring system:
// +1 for every exact match in quiz answers (assuming we compare to room's "avg" or just a tag system? 
// For now, let's use INTERESTS matching as the primary driver, and Vibe Score as secondary.
// The user prompt said: "Searches the rooms table for rooms that share at least 3 interest tags."

export async function findBestRoom(userId: string, userInterests: string[], userQuizAnswers: number[]) {
    const supabase = createClient()

    // 1. Fetch all rooms
    const { data: allRooms, error } = await supabase
        .from('rooms')
        .select('id, name, tags')

    if (error || !allRooms) return null

    // Filter for rooms with space (< 12 members)
    const rooms: Room[] = []
    for (const room of allRooms) {
        const { count } = await supabase
            .from('room_members')
            .select('*', { count: 'exact', head: true })
            .eq('room_id', room.id)

        if (count !== null && count < 12) {
            rooms.push(room)
        }
    }

    if (rooms.length === 0) {
        // Fallback to creation logic if no rooms available at all
        return createFallbackRoom(userInterests, supabase)
    }

    let bestRoom = null
    let maxScore = -1

    // 2. Score each room
    for (const room of rooms) {
        let score = 0

        // Interest Overlap (+2 per match)
        const commonInterests = room.tags?.filter((tag: string) => userInterests.includes(tag)) || []
        score += commonInterests.length * 2

        // If score is 0 (no shared interests), skip unless we are desperate
        if (score === 0) continue

        // Vibe Score (Placeholder)
        score += Math.random()

        if (score > maxScore) {
            maxScore = score
            bestRoom = room
        }
    }

    // 3. Fallback: Create a new room if no good match
    if (!bestRoom || maxScore < 2) { // Less than 1 shared interest
        return createFallbackRoom(userInterests, supabase)
    }

    return bestRoom.id
}

async function createFallbackRoom(userInterests: string[], supabase: any) {
    const topInterest = userInterests[0] || 'General'
    const randomVibe = ['Chill', 'Late Night', 'Study', 'Vibes'][Math.floor(Math.random() * 4)]

    const { data: newRoom } = await supabase
        .from('rooms')
        .insert({
            name: `The ${topInterest.charAt(0).toUpperCase() + topInterest.slice(1)} ${randomVibe}`,
            tags: userInterests.slice(0, 3) // Tag with user's top 3
        })
        .select()
        .single()

    return newRoom?.id
}
