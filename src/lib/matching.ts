import { createClient } from '@/lib/supabase/client'

// STRICT QUALITY CONTROL
export const MINIMUM_MATCH_THRESHOLD = 65;

export interface UserProfile {
    id: string
    username: string
    age: number
    interests: string[]
    quiz_answers: number[]
}

/**
 * calculateMatch
 * Enforces a strict threshold to prevent "desperate" matches.
 * Uses quiz answers (on a scale of 0-3) to determine compatibility.
 */
export function calculateMatch(myAnswers: number[] | null, theirAnswers: number[] | null): number {
    if (!myAnswers || !theirAnswers || myAnswers.length === 0 || theirAnswers.length === 0) {
        return 0; // No data, no match
    }

    const length = Math.min(myAnswers.length, theirAnswers.length)
    let totalDiff = 0

    for (let i = 0; i < length; i++) {
        totalDiff += Math.abs(myAnswers[i] - theirAnswers[i])
    }

    // Logic: 100 - (Total Diff * Multiplier)
    // Assuming 8 questions, max diff of 3 per question (0-3 index) => max diff 24.
    // 24 * 3 = 72. 100 - 72 = 28%.
    const score = 100 - Math.round(totalDiff * 3.1)

    // Enforce Threshold
    const finalScore = Math.max(score, 0)
    return finalScore >= MINIMUM_MATCH_THRESHOLD ? finalScore : 0;
}

/**
 * findBestRoom
 * Scoring for group rooms based on interest overlap.
 */
export async function findBestRoom(userId: string, userInterests: string[], userQuizAnswers: number[]) {
    const supabase = createClient()

    // 1. Fetch available rooms
    const { data: rooms, error } = await supabase
        .from('rooms')
        .select('*')

    if (error || !rooms) return null

    let bestRoom = null
    let maxScore = -1

    for (const room of rooms) {
        let score = 0

        // Interest Overlap (+2 per match)
        const commonInterests = room.tags?.filter((tag: string) => userInterests.includes(tag)) || []
        score += commonInterests.length * 2

        // Category match (+5)
        if (userInterests.includes(room.category)) {
            score += 5
        }

        if (score > maxScore) {
            maxScore = score
            bestRoom = room
        }
    }

    // Must have at least some overlap
    if (!bestRoom || maxScore < 2) return null

    return bestRoom.id
}
