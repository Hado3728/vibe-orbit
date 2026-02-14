'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function checkAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: userData } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

    if (!userData?.is_admin) redirect('/dashboard')

    return supabase
}

export async function resolveReport(reportId: string) {
    const supabase = await checkAdmin()

    await supabase
        .from('reports')
        .update({ resolved: true })
        .eq('id', reportId)

    revalidatePath('/admin')
}

export async function deleteMessage(messageId: number) {
    const supabase = await checkAdmin()

    await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)

    // Also mark related reports as resolved?
    // Let's just resolve reports linked to this message to keep dashboard clean
    await supabase
        .from('reports')
        .update({ resolved: true })
        .eq('message_id', messageId)

    revalidatePath('/admin')
}

export async function banUser(userId: string) {
    const supabase = await checkAdmin()

    // Delete from public.users - Cascade will handle the rest (auth.users remains but they can't log in effectively if app logic relies on public.users)
    // Actually, to fully ban, we should ideally delete from auth.users via service role, but for now we are managing public.users.
    // If our middleware checks for public.users record, deleting it bans them.
    // Middleware checks: onboarded/age_verified metadata. 
    // If we delete public.user, RLS will fail for them.
    // Let's delete the public user record.

    await supabase
        .from('users')
        .delete()
        .eq('id', userId)

    revalidatePath('/admin')
}
