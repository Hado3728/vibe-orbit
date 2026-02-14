import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export default function RoomsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Active Rooms</h1>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                    <Card key={i}>
                        <CardHeader>
                            <CardTitle>Chill Vibe #{i}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">12 online • Lo-fi Music</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
