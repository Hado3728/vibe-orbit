'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Label } from '@/components/ui/Label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup'
import { Textarea } from '@/components/ui/Textarea'
import { Flag, AlertTriangle } from 'lucide-react'

interface ReportModalProps {
    messageId: number
    reportedUserId: string
    trigger?: React.ReactNode
}

const REASONS = [
    "Inappropriate Content",
    "Spam / Bot",
    "Bullying / Harassment",
    "Personal Information Shared",
    "Other"
]

export function ReportModal({ messageId, reportedUserId, trigger }: ReportModalProps) {
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState(REASONS[0])
    const [note, setNote] = useState('')
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { error } = await supabase.from('reports').insert({
                reporter_id: user.id,
                reported_id: reportedUserId,
                message_id: messageId,
                reason,
                note
            })

            if (error) throw error

            setOpen(false)
            alert("Report submitted. Thank you for keeping Orbit safe.")
        } catch (e) {
            console.error(e)
            alert("Failed to submit report. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="text-destructive hover:text-destructive/80 text-xs flex items-center gap-1">
                        <Flag className="h-3 w-3" /> Report
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" /> Report Message
                    </DialogTitle>
                    <DialogDescription>
                        Help us keep Orbit safe. This report will be reviewed by admins.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <RadioGroup value={reason} onValueChange={setReason} className="grid gap-2">
                        {REASONS.map((r) => (
                            <div key={r} className="flex items-center space-x-2">
                                <RadioGroupItem value={r} id={r} />
                                <Label htmlFor={r}>{r}</Label>
                            </div>
                        ))}
                    </RadioGroup>

                    <div className="grid gap-2">
                        <Label htmlFor="note">Additional Details (Optional)</Label>
                        <Textarea
                            id="note"
                            placeholder="Context helps us understand..."
                            value={note}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
