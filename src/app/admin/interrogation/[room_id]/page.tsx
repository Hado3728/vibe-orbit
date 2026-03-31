import { Sparkles, ShieldAlert } from 'lucide-react'

export default async function InterrogationRoomPage({ params }: { params: Promise<{ room_id: string }> }) {
    const { room_id } = await params;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(225,29,72,0.15),rgba(255,255,255,0))] text-slate-100 p-8">
            <div className="max-w-xl w-full text-center space-y-6">
                
                <div className="h-20 w-20 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-500/20 ring-1 ring-rose-500/50">
                    <ShieldAlert className="h-10 w-10 text-rose-500" />
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight">Interrogation Hub</h1>
                <p className="text-slate-400 text-sm font-mono bg-slate-950/50 inline-block px-4 py-2 rounded-full border border-slate-800">
                    Session: {room_id}
                </p>

                <div className="bg-slate-950 border border-slate-800 rounded-3xl p-10 mt-12 shadow-sm">
                    <h2 className="text-2xl font-bold mb-3 text-slate-200">The suspect is isolated.</h2>
                    <p className="text-slate-400 leading-relaxed mb-8">
                        The secure chat interface and evidence locker are currently under deployment. This room is locked and monitored.
                    </p>
                    
                    <div className="flex justify-center items-center gap-2 text-rose-400 font-semibold bg-rose-500/10 py-3 rounded-xl">
                        <Sparkles className="h-5 w-5 animate-pulse" />
                        Chat System Coming Soon
                    </div>
                </div>

            </div>
        </div>
    )
}
