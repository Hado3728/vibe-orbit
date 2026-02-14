'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, useMotionTemplate, useMotionValue, animate } from 'framer-motion'
import { ArrowRight, Sparkles, Orbit, ShieldCheck, Zap, Lock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function LandingPage() {
    const [mounted, setMounted] = useState(false)

    // Mouse tracking for spotlight effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    useEffect(() => {
        setMounted(true)

        const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
            mouseX.set(clientX)
            mouseY.set(clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    // Spotlight gradient
    const background = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(99, 102, 241, 0.15), transparent 80%)`

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30 overflow-hidden relative">

            {/* Dynamic Background Spotlight */}
            <motion.div
                className="pointer-events-none fixed inset-0 z-30 transition duration-300 md:block hidden"
                style={{ background }}
            />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10 flex flex-col min-h-screen">

                {/* Navbar */}
                <nav className="flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Orbit className="h-6 w-6 text-white animate-spin-slow" />
                        </div>
                        <span className="text-xl font-bold tracking-tight">Orbit</span>
                    </div>
                    <div>
                        <Link href="/login">
                            <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-4xl mx-auto space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-4">
                            <Sparkles className="h-4 w-4" />
                            <span>Experience the future of connection</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white/90 to-white/50 pb-2">
                            Sync Your Vibe. <br />
                            <span className="text-indigo-400">Find Your Orbit.</span>
                        </h1>

                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            The social discovery engine that matches you based on energy, not just aesthetics.
                            Find your people in a universe of noise.
                        </p>

                        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/login">
                                <Button className="h-14 px-8 text-lg bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] hover:shadow-[0_0_60px_-10px_rgba(79,70,229,0.6)] transition-all duration-300 transform hover:scale-105 group relative overflow-hidden">
                                    <span className="relative z-10 flex items-center gap-2">
                                        Enter the Orbit <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                    {/* Button sheen effect */}
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>

                {/* Workflow Section */}
                <section className="py-24 bg-slate-900/50 border-t border-white/5 backdrop-blur-sm">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                {
                                    icon: Zap,
                                    title: "The Vibe Quiz",
                                    desc: "Answer 5 deep questions to calibrate your unique frequency.",
                                    color: "text-yellow-400",
                                    bg: "bg-yellow-400/10"
                                },
                                {
                                    icon: Orbit, // Replacing CPU with Orbit for specific vibe
                                    title: "AI Orbiting",
                                    desc: "Our engine calculates compatibility scores in real-time.",
                                    color: "text-indigo-400",
                                    bg: "bg-indigo-500/10"
                                },
                                {
                                    icon: Sparkles,
                                    title: "Instant Connection",
                                    desc: "Jump into secure, real-time chats with your top matches.",
                                    color: "text-pink-400",
                                    bg: "bg-pink-500/10"
                                }
                            ].map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="relative group p-8 rounded-3xl bg-slate-900 border border-white/10 hover:border-indigo-500/30 transition-colors"
                                >
                                    <div className={`h-14 w-14 rounded-2xl ${step.bg} ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                        <step.icon className="h-7 w-7" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-3 text-gray-100">{step.title}</h3>
                                    <p className="text-gray-400 leading-relaxed">{step.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Security Section */}
                <section className="py-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-900/10 skew-y-3 transform origin-bottom-right z-0 pointer-events-none" />
                    <div className="max-w-5xl mx-auto text-center relative z-10">
                        <div className="inline-flex items-center justify-center p-3 rounded-full bg-slate-800 border border-slate-700 mb-8">
                            <ShieldCheck className="h-6 w-6 text-emerald-400" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Your Safe Space in Orbit</h2>
                        <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-12">
                            End-to-End Privacy. No Public Profiles. Only matches see you.
                            <br className="hidden md:block" />
                            Your data stays in your orbit.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
                            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md flex items-start gap-4">
                                <Lock className="h-6 w-6 text-emerald-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-emerald-100 mb-1">Row-Level Security</h4>
                                    <p className="text-sm text-gray-400">We use Supabase RLS policies to ensure your chats and data effectively don't exist to anyone but you and your match.</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-2xl bg-slate-900/80 border border-emerald-500/20 backdrop-blur-md flex items-start gap-4">
                                <ShieldCheck className="h-6 w-6 text-emerald-400 mt-1 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-emerald-100 mb-1">Instant Control</h4>
                                    <p className="text-sm text-gray-400">Block and report tools are just one click away. Our moderation system keeps the orbit clean of bad vibes.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
                    <p>© {new Date().getFullYear()} Orbit. Designed for the stars.</p>
                </footer>
            </div>
        </div>
    )
}
