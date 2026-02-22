"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ── Yeti SVG mascot ──────────────────────────────────────────────────────────
function YetiFace({ mood }: { mood: "default" | "excited" | "send" | "google" | "watching" }) {
    // Eyes change with mood
    const eyeConfig = {
        default: { left: "◉", right: "◉", brow: "─" },
        excited: { left: "★", right: "★", brow: "╰" },
        send: { left: "▶", right: "▶", brow: "╱" },
        google: { left: "◉", right: "◉", brow: "~" },
        watching: { left: "👁", right: "👁", brow: "─" },
    };
    const e = eyeConfig[mood];
    const isExcited = mood === "excited" || mood === "send";

    return (
        <svg viewBox="0 0 120 110" className="w-28 h-28 drop-shadow-2xl" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer glow */}
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
                <radialGradient id="bodyGrad" cx="50%" cy="40%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="100%" stopColor="#94a3b8" />
                </radialGradient>
                <radialGradient id="faceGrad" cx="50%" cy="35%">
                    <stop offset="0%" stopColor="#f1f5f9" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </radialGradient>
            </defs>

            {/* Fur/body silhouette */}
            <ellipse cx="60" cy="72" rx="42" ry="32" fill="url(#bodyGrad)" opacity="0.95" />
            {/* Fluffy ear tufts */}
            <ellipse cx="24" cy="45" rx="13" ry="16" fill="url(#bodyGrad)" />
            <ellipse cx="96" cy="45" rx="13" ry="16" fill="url(#bodyGrad)" />
            <ellipse cx="24" cy="44" rx="8" ry="11" fill="url(#faceGrad)" opacity="0.7" />
            <ellipse cx="96" cy="44" rx="8" ry="11" fill="url(#faceGrad)" opacity="0.7" />
            {/* Face */}
            <ellipse cx="60" cy="54" rx="34" ry="36" fill="url(#faceGrad)" />
            {/* Muzzle */}
            <ellipse cx="60" cy="72" rx="16" ry="11" fill="white" opacity="0.8" />

            {/* Brows */}
            <text x="32" y="38" fontSize="10" fill="#475569" fontWeight="bold" textAnchor="middle">{e.brow}</text>
            <text x="88" y="38" fontSize="10" fill="#475569" fontWeight="bold" textAnchor="middle" transform={mood === "send" ? "scale(-1,1) translate(-176,0)" : ""}>{e.brow}</text>

            {/* Eyes */}
            <text x="44" y="58" fontSize="13" fill="#1e293b" textAnchor="middle" filter="url(#glow)">{e.left}</text>
            <text x="76" y="58" fontSize="13" fill="#1e293b" textAnchor="middle" filter="url(#glow)">{e.right}</text>

            {/* Nose */}
            <ellipse cx="60" cy="67" rx="5" ry="3.5" fill="#7c8fa6" />

            {/* Mouth — big smile when excited */}
            {isExcited ? (
                <path d="M50 76 Q60 84 70 76" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : mood === "watching" ? (
                <path d="M52 77 Q60 74 68 77" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
            ) : (
                <path d="M51 76 Q60 81 69 76" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />
            )}

            {/* Indigo sparkle accents */}
            <circle cx="18" cy="25" r="2" fill="#818cf8" opacity="0.7" />
            <circle cx="102" cy="22" r="1.5" fill="#a78bfa" opacity="0.7" />
            <circle cx="12" cy="60" r="1.5" fill="#6366f1" opacity="0.5" />
        </svg>
    );
}

// ── Speech Bubble ────────────────────────────────────────────────────────────
function SpeechBubble({ message }: { message: string }) {
    return (
        <div className="relative flex flex-col items-center mb-1 animate-in fade-in duration-200">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-2xl shadow-lg shadow-indigo-500/10 max-w-[220px] text-center leading-snug">
                {message}
            </div>
            {/* Tail pointing down toward yeti */}
            <div className="w-3 h-3 bg-slate-800/80 border-r border-b border-slate-700/80 rotate-45 -mt-1.5 shadow-sm" />
        </div>
    );
}

// ── Mood type ────────────────────────────────────────────────────────────────
type Mood = "default" | "excited" | "send" | "google" | "watching";

const MESSAGES: Record<Mood, string> = {
    default: "Ready to enter the Orbit? 🥶",
    excited: "Type your email to get a magic link! ✉️",
    send: "Send it! Let's go! 🚀",
    google: "Google is faster anyway... 🤫",
    watching: "I'm watching you... 👀",
};

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [mood, setMood] = useState<Mood>("default");

    const setHover = (m: Mood) => setMood(m);
    const clearHover = () => setMood("watching");

    // ── Auth handlers ──────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                // Routes through PKCE callback → sets session cookie → /dashboard
                emailRedirectTo: `${window.location.origin}/api/auth/callback`,
            },
        });

        if (error) {
            setMessage(error.message);
        } else {
            setMessage("Magic link sent! Check your email.");
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                // Hardcoded exact production URL — no variables, no guessing.
                redirectTo: "https://vibe-orbit-production.up.railway.app/api/auth/callback",
            },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))] p-4">
            <div className="w-full max-w-md flex flex-col items-center">

                {/* ── Yeti mascot area ──────────────────────────────────── */}
                <SpeechBubble message={MESSAGES[mood]} />
                <div
                    className="transition-transform duration-200 hover:scale-105"
                    onMouseEnter={() => setMood("default")}
                    onMouseLeave={() => setMood("default")}
                >
                    <YetiFace mood={mood} />
                </div>

                {/* ── Card ─────────────────────────────────────────────── */}
                <Card className="w-full bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl shadow-indigo-500/10 rounded-3xl overflow-hidden -mt-2">
                    <CardHeader className="text-center pt-8 pb-4">
                        <CardTitle className="text-3xl font-extrabold text-white tracking-tight">Orbit</CardTitle>
                        <p className="text-sm text-slate-400 mt-2 font-medium">No creeps. No judging. Just vibes.</p>
                    </CardHeader>

                    <CardContent className="px-8 pb-10">
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Enter your email..."
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-12 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    onMouseEnter={() => setHover("excited")}
                                    onMouseLeave={clearHover}
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                disabled={loading}
                                onMouseEnter={() => setHover("send")}
                                onMouseLeave={clearHover}
                            >
                                {loading ? "Sending..." : "Send Magic Link"}
                            </Button>
                        </form>

                        <div className="mt-8 flex flex-col gap-4">
                            {/* Divider */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">Or continue with</span>
                                </div>
                            </div>

                            {/* Google */}
                            <Button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm rounded-xl h-12 font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                onMouseEnter={() => setHover("google")}
                                onMouseLeave={clearHover}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>

                            {message && (
                                <p className="text-center text-sm font-medium text-indigo-300 mt-2 bg-indigo-950/50 border border-indigo-900/50 p-2 rounded-lg">
                                    {message}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}