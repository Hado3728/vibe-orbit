'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function dismissReport(reportId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('reports')
        .update({ status: 'resolved' })
        .eq('id', reportId)

    if (error) {
        console.error('Failed to dismiss report:', error)
        throw new Error('Could not dismiss report')
    }

    revalidatePath('/admin/reports')
}

export async function openInvestigation(reportId: string, suspectId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized ADMIN access')

    // 1. Update users table: Freeze the suspect
    const { error: userError } = await supabase
        .from('users')
        .update({ account_status: 'under_investigation' })
        .eq('id', suspectId)

    if (userError) throw new Error('Failed to update suspect account status')

    // 2. Update reports table: Mark investigating
    const { error: reportError } = await supabase
        .from('reports')
        .update({ status: 'investigating' })
        .eq('id', reportId)

    if (reportError) throw new Error('Failed to update report status')

    // 3. Insert into admin_rooms: Link the admin, suspect, and report
    const { data: room, error: roomError } = await supabase
        .from('admin_rooms')
        .insert({
            report_id: reportId,
            suspect_id: suspectId,
            admin_id: user.id
        })
        .select('id')
        .single()

    if (roomError || !room) {
        throw new Error('Failed to create interrogation room: ' + roomError?.message)
    }

    // 4. Redirect the Admin to the Interrogation hub
    redirect(`/admin/interrogation/${room.id}`)
}
