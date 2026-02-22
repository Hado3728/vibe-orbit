"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ── Types ────────────────────────────────────────────────────────────────────
type Mood = "default" | "excited" | "send" | "google";

const MESSAGES: Record<Mood, string> = {
    default: "Ready to enter the Orbit? 🥶",
    excited: "Type your email for a magic link! ✉️",
    send: "Send it! Let's go! 🚀",
    google: "Google is faster anyway... 🤫",
};

// ── Hanging Yeti SVG ─────────────────────────────────────────────────────────
// The Yeti's head peeks up; its paws hang down to grip the card's top edge.
// viewBox is deliberately taller than wide so paws reach down.
function HangingYeti({ mood }: { mood: Mood }) {
    const excited = mood === "excited" || mood === "send";
    const sneaky = mood === "google";

    return (
        <svg
            viewBox="0 0 160 145"
            className="w-36 h-36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <radialGradient id="furGrad" cx="50%" cy="30%" r="60%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                </radialGradient>
                <radialGradient id="faceGrad" cx="50%" cy="35%" r="55%">
                    <stop offset="0%" stopColor="#ddd6fe" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                </radialGradient>
                <radialGradient id="leftPaw" cx="40%" cy="30%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </radialGradient>
                <radialGradient id="rightPaw" cx="60%" cy="30%">
                    <stop offset="0%" stopColor="#f8fafc" />
                    <stop offset="100%" stopColor="#cbd5e1" />
                </radialGradient>
                <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#6d28d9" floodOpacity="0.3" />
                </filter>
            </defs>

            {/* ── Left paw (hangs down, grips card edge at y≈120) ── */}
            <g>
                {/* Arm */}
                <path d="M28 95 Q18 108 20 122" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" fill="none" />
                {/* Paw pad */}
                <ellipse cx="21" cy="125" rx="14" ry="10" fill="url(#leftPaw)" stroke="#c7d2fe" strokeWidth="1.5" />
                {/* Fingers */}
                <ellipse cx="10" cy="121" rx="5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
                <ellipse cx="17" cy="118" rx="5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
                <ellipse cx="25" cy="118" rx="5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
                <ellipse cx="32" cy="121" rx="4.5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
            </g>

            {/* ── Right paw ── */}
            <g>
                <path d="M132 95 Q142 108 140 122" stroke="#e2e8f0" strokeWidth="16" strokeLinecap="round" fill="none" />
                <ellipse cx="139" cy="125" rx="14" ry="10" fill="url(#rightPaw)" stroke="#c7d2fe" strokeWidth="1.5" />
                <ellipse cx="128" cy="121" rx="4.5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
                <ellipse cx="135" cy="118" rx="5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
                <ellipse cx="143" cy="118" rx="5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
                <ellipse cx="150" cy="121" rx="5" ry="3.5" fill="#f1f5f9" stroke="#c7d2fe" strokeWidth="1" />
            </g>

            {/* ── Body / fur bulk (behind head) ── */}
            <ellipse cx="80" cy="92" rx="46" ry="38" fill="url(#furGrad)" filter="url(#softShadow)" />

            {/* ── Ear tufts ── */}
            <ellipse cx="38" cy="46" rx="18" ry="22" fill="#f8fafc" />
            <ellipse cx="122" cy="46" rx="18" ry="22" fill="#f8fafc" />
            {/* Inner ear */}
            <ellipse cx="38" cy="46" rx="10" ry="13" fill="#ede9fe" />
            <ellipse cx="122" cy="46" rx="10" ry="13" fill="#ede9fe" />

            {/* ── Head ── */}
            <ellipse cx="80" cy="64" rx="42" ry="44" fill="url(#furGrad)" />
            {/* Face overlay (violet tint on lower-center) */}
            <ellipse cx="80" cy="72" rx="30" ry="30" fill="url(#faceGrad)" opacity="0.55" />

            {/* ── Muzzle ── */}
            <ellipse cx="80" cy="84" rx="18" ry="12" fill="#ffffff" opacity="0.85" />

            {/* ── Brows ── */}
            {excited ? (
                <>
                    {/* Raised excited brows */}
                    <path d="M54 47 Q62 42 70 46" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M90 46 Q98 42 106 47" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
            ) : sneaky ? (
                <>
                    {/* One raised, one flat — shifty */}
                    <path d="M54 47 Q62 44 70 47" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M90 45 Q98 49 106 47" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
            ) : (
                <>
                    {/* Calm flat brows */}
                    <path d="M54 48 Q62 46 70 48" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    <path d="M90 48 Q98 46 106 48" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </>
            )}

            {/* ── Eyes ── */}
            {sneaky ? (
                // Half-lidded sneaky eyes
                <>
                    <ellipse cx="62" cy="62" rx="8" ry="8" fill="white" />
                    <ellipse cx="62" cy="63" rx="5" ry="5" fill="#1e1b4b" />
                    <ellipse cx="64" cy="61" rx="1.5" ry="1.5" fill="white" />
                    {/* Heavy upper lid */}
                    <path d="M54 57 Q62 54 70 57" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" fill="none" />

                    <ellipse cx="98" cy="62" rx="8" ry="8" fill="white" />
                    <ellipse cx="98" cy="63" rx="5" ry="5" fill="#1e1b4b" />
                    <ellipse cx="100" cy="61" rx="1.5" ry="1.5" fill="white" />
                    <path d="M90 57 Q98 54 106 57" stroke="#f8fafc" strokeWidth="5" strokeLinecap="round" fill="none" />
                </>
            ) : excited ? (
                // Wide star eyes
                <>
                    <ellipse cx="62" cy="63" rx="9" ry="9" fill="white" />
                    <ellipse cx="62" cy="63" rx="6" ry="6" fill="#4f46e5" />
                    <ellipse cx="64" cy="61" rx="2" ry="2" fill="white" />

                    <ellipse cx="98" cy="63" rx="9" ry="9" fill="white" />
                    <ellipse cx="98" cy="63" rx="6" ry="6" fill="#4f46e5" />
                    <ellipse cx="100" cy="61" rx="2" ry="2" fill="white" />
                </>
            ) : (
                // Default friendly eyes
                <>
                    <ellipse cx="62" cy="63" rx="8.5" ry="8.5" fill="white" />
                    <ellipse cx="62" cy="64" rx="5.5" ry="5.5" fill="#1e1b4b" />
                    <ellipse cx="64" cy="62" rx="1.8" ry="1.8" fill="white" />

                    <ellipse cx="98" cy="63" rx="8.5" ry="8.5" fill="white" />
                    <ellipse cx="98" cy="64" rx="5.5" ry="5.5" fill="#1e1b4b" />
                    <ellipse cx="100" cy="62" rx="1.8" ry="1.8" fill="white" />
                </>
            )}

            {/* ── Nose ── */}
            <ellipse cx="80" cy="78" rx="5.5" ry="4" fill="#7c3aed" />

            {/* ── Mouth ── */}
            {excited ? (
                <path d="M68 87 Q80 97 92 87" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            ) : sneaky ? (
                <path d="M70 88 Q80 84 90 88" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            ) : (
                <path d="M70 87 Q80 93 90 87" stroke="#5b21b6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            )}

            {/* ── Indigo sparkles ── */}
            <circle cx="22" cy="30" r="2.5" fill="#818cf8" opacity="0.8" />
            <circle cx="138" cy="28" r="2" fill="#a78bfa" opacity="0.7" />
            <circle cx="12" cy="72" r="1.5" fill="#6366f1" opacity="0.5" />
        </svg>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [mood, setMood] = useState<Mood>("default");

    // ── Auth ──────────────────────────────────────────────────────────────
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
        });
        setMessage(error ? error.message : "Magic link sent! Check your email.");
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: "https://vibe-orbit-production.up.railway.app/api/auth/callback" },
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(79,70,229,0.15),rgba(255,255,255,0))] p-4">
            <div className="w-full max-w-md">

                {/* ── Speech bubble — absolute so it never shifts layout ── */}
                <div className="relative h-20 flex items-end justify-center mb-0">
                    <div className="absolute bottom-0 flex flex-col items-center pointer-events-none select-none">
                        <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 text-slate-200 text-sm font-medium px-4 py-2 rounded-2xl shadow-lg shadow-indigo-500/10 max-w-[240px] text-center leading-snug whitespace-nowrap">
                            {MESSAGES[mood]}
                        </div>
                        {/* Bubble tail */}
                        <div className="w-0 h-0 border-l-[7px] border-r-[7px] border-t-[8px] border-l-transparent border-r-transparent border-t-slate-700/80" />
                    </div>
                </div>

                {/* ── Yeti + Card wrapper — relative so yeti hangs over card ── */}
                <div className="relative">
                    {/* Yeti hangs over the card top edge */}
                    <div className="absolute -top-[88px] left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                        <HangingYeti mood={mood} />
                    </div>

                    {/* Card */}
                    <Card className="w-full bg-slate-900/60 backdrop-blur-xl border-slate-800 shadow-2xl shadow-indigo-500/10 rounded-3xl overflow-visible relative z-10">
                        <CardHeader className="text-center pt-16 pb-4">
                            <CardTitle className="text-3xl font-extrabold text-white tracking-tight">Orbit</CardTitle>
                            <p className="text-sm text-slate-400 mt-2 font-medium">No creeps. No judging. Just vibes.</p>
                        </CardHeader>

                        <CardContent className="px-8 pb-10">
                            <form onSubmit={handleLogin} className="space-y-4">
                                <Input
                                    type="email"
                                    placeholder="Enter your email..."
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl h-12 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    onMouseEnter={() => setMood("excited")}
                                    onMouseLeave={() => setMood("default")}
                                />
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 font-semibold shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]"
                                    onMouseEnter={() => setMood("send")}
                                    onMouseLeave={() => setMood("default")}
                                >
                                    {loading ? "Sending..." : "Send Magic Link"}
                                </Button>
                            </form>

                            <div className="mt-8 flex flex-col gap-4">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t border-slate-800" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-slate-900 px-2 text-slate-500 font-semibold tracking-wider">Or continue with</span>
                                    </div>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleGoogleLogin}
                                    className="w-full bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 shadow-sm rounded-xl h-12 font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                    onMouseEnter={() => setMood("google")}
                                    onMouseLeave={() => setMood("default")}
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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
        </div>
    );
}