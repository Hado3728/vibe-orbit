import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
    return (
        <div className="space-y-6 max-w-2xl">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <div className="p-6 border rounded-lg bg-card text-card-foreground">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="custom-avatar h-20 w-20 rounded-full bg-primary/20"></div>
                        <div>
                            <h2 className="text-xl font-semibold">User Name</h2>
                            <p className="text-sm text-muted-foreground">@username</p>
                        </div>
                    </div>
                    <Button variant="outline">Edit Profile</Button>
                </div>
            </div>
        </div>
    )
}
