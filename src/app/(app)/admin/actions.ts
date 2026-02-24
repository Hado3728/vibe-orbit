'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!userData?.is_admin) return null

    return supabase
}

export async function updateReportStatus(reportId: string, status: 'pending' | 'investigating' | 'resolved') {
    const supabase = await checkAdmin()
    if (!supabase) return false

    try {
        const { error } = await supabase
            .from('reports')
            .update({ status })
            .eq('id', reportId)

        if (error) throw error
        revalidatePath('/admin')
        return true
    } catch (error) {
        console.error('Error updating report status:', error)
        return false
    }
}

export async function createAdminMessage(reportId: string, senderId: string, recipientId: string, content: string) {
    const supabase = await checkAdmin()
    if (!supabase) return false

    try {
        const { error } = await supabase
            .from('admin_messages')
            .insert({
                report_id: reportId,
                sender_id: senderId,
                recipient_id: recipientId,
                content
            })

        if (error) throw error
        return true
    } catch (error) {
        console.error('Error sending admin message:', error)
        return false
    }
}

export async function banUser(userId: string) {
    const supabase = await checkAdmin()
    if (!supabase) return false

    try {
        // In this implementation, deleting the public profile effectively bans them
        // if the app requires profile existence for access.
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', userId)

        if (error) throw error
        revalidatePath('/admin')
        return true
    } catch (error) {
        console.error('Error banning user:', error)
        return false
    }
}
