import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, Music, Code, Gamepad2, Heart, Users, ShieldCheck, Sparkles } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            {/* Hero Section */}
            <section className="relative flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center space-y-8 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />

                <div className="space-y-4 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary-foreground font-medium mb-4">
                        <Sparkles className="mr-1 h-3 w-3" />
                        Beta Access Open
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground">
                        No creeps. <span className="text-primary">No judging.</span> <br />
                        Just people like you.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        A safe space for teens to find friends, study buddies, and people who share your vibes.
                        No dating, just genuine connections.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <Link href="/login">
                        <Button size="lg" className="rounded-full px-8 text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
                            Get Started <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </Link>
                </div>
            </section>

            {/* How it Works Section */}
            <section className="py-24 bg-secondary/30 px-4">
                <div className="max-w-6xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-3xl md:text-4xl font-bold">How <span className="text-primary">Orbit</span> Works</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            We've ditched the swipe culture for something real. Here is how you find your crew.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        {/* Step 1 */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Gamepad2 className="h-6 w-6 text-primary" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">1. Pick Interests</h3>
                            <p className="text-sm text-muted-foreground">Select what you love—Gaming, Coding, Music, or Art.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Sparkles className="h-6 w-6 text-accent-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">2. Vibe Quiz</h3>
                            <p className="text-sm text-muted-foreground">Take a quick 60-second quiz to define your personality style.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 rounded-2xl bg-secondary/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Users className="h-6 w-6 text-secondary-foreground" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">3. Get Placed</h3>
                            <p className="text-sm text-muted-foreground">Join a small, moderated pod of 8-12 people just like you.</p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="h-6 w-6 text-orange-600" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">4. Chat Safely</h3>
                            <p className="text-sm text-muted-foreground">Messages only. No images, no links. Just pure conversation.</p>
                        </div>

                        {/* Step 5 */}
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-white/50 shadow-sm hover:shadow-md transition-all group">
                            <div className="h-12 w-12 rounded-2xl bg-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Heart className="h-6 w-6 text-pink-500" />
                            </div>
                            <h3 className="font-semibold text-lg mb-2">5. Connect</h3>
                            <p className="text-sm text-muted-foreground">Find a bestie? Mutually agree to unlock private chats.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
