'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Loader2, Save, Tag } from 'lucide-react'
import { updateProfile } from '@/app/(app)/profile/actions'
import { cn } from '@/lib/utils'

interface ProfileData {
    username: string
    bio: string
    interests: string[]
}

export default function EditProfileForm({ initialData }: { initialData: ProfileData }) {
    const [formData, setFormData] = useState<ProfileData>(initialData)
    const [isSaving, setIsSaving] = useState(false)
    const [newInterest, setNewInterest] = useState('')

    const handleSave = async () => {
        setIsSaving(true)
        const result = await updateProfile(formData)
        if (result.success) {
            alert('Profile updated successfully! ✨')
        } else {
            alert('Error updating profile: ' + result.error)
        }
        setIsSaving(false)
    }

    const addInterest = () => {
        if (!newInterest.trim()) return
        if (formData.interests.includes(newInterest.trim())) {
            setNewInterest('')
            return
        }
        setFormData(prev => ({
            ...prev,
            interests: [...prev.interests, newInterest.trim()]
        }))
        setNewInterest('')
    }

    const removeInterest = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== tag)
        }))
    }

    return (
        <Card className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border-white/20 dark:border-white/10 shadow-2xl overflow-hidden">
            <CardHeader className="border-b border-white/10 bg-white/5">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    Edit Your Orbit Identity
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                {/* Username */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest pl-1">Username</label>
                    <Input
                        value={formData.username}
                        onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Enter your cosmic handle..."
                        className="bg-white/5 border-white/10 focus:border-primary/50 text-lg font-medium"
                    />
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest pl-1">Bio</label>
                    <textarea
                        value={formData.bio || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell the orbit about yourself..."
                        className="w-full min-h-[120px] p-3 rounded-lg bg-white/5 border border-white/10 focus:border-primary/50 outline-none transition-all resize-none text-sm leading-relaxed"
                    />
                </div>

                {/* Interests */}
                <div className="space-y-4">
                    <label className="text-xs font-bold text-foreground/50 uppercase tracking-widest pl-1">Vibe Tags</label>

                    <div className="flex gap-2">
                        <Input
                            value={newInterest}
                            onChange={(e) => setNewInterest(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                            placeholder="Add a new interest..."
                            className="bg-white/5 border-white/10"
                        />
                        <Button onClick={addInterest} type="button" size="icon" className="shrink-0 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20">
                            <Tag className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {formData.interests.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => removeInterest(tag)}
                                className="group px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/20 transition-all flex items-center gap-2"
                            >
                                #{tag}
                                <span className="opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="pt-4 flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-8 h-12 rounded-xl font-bold transition-all active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Transmitting...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
