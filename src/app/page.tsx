"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
interface Star {
    x: number; y: number; z: number;
    size: number; baseOpacity: number; speed: number;
    currentX: number; currentY: number;
}

const STAR_COUNT = 240;

function createStars(w: number, h: number): Star[] {
    return Array.from({ length: STAR_COUNT }, () => {
        const x = Math.random() * w, y = Math.random() * h;
        return { x, y, currentX: x, currentY: y, z: Math.random(), size: Math.random() * 1.8 + 0.3, baseOpacity: Math.random() * 0.55 + 0.2, speed: Math.random() * 0.25 + 0.05 };
    });
}

// ── Icon Components ──────────────────────────────────────────────────────────
function SunIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="5" /><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    );
}
function MoonIcon() {
    return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
        </svg>
    );
}

// ── Abstract Glass Visuals (Section 4) ───────────────────────────────────────
function ShieldVisual({ isDark }: { isDark: boolean }) {
    const base = isDark ? "bg-slate-800/50" : "bg-white/50";
    const border = isDark ? "border-indigo-500/20" : "border-indigo-300/30";
    return (
        <div className={`relative w-full aspect-square max-w-sm mx-auto rounded-3xl ${base} backdrop-blur-md border ${border} flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />
            {/* Rings */}
            <div className="absolute inset-8 rounded-full border border-indigo-400/20 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute inset-16 rounded-full border border-violet-400/20 animate-ping" style={{ animationDuration: "2s", animationDelay: "0.5s" }} />
            {/* Shield icon */}
            <div className="relative z-10 flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/30 to-violet-600/30 rounded-2xl border border-indigo-400/30 flex items-center justify-center backdrop-blur-sm">
                    <svg className="w-10 h-10 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                </div>
                <span className={`text-xs font-bold tracking-widest uppercase ${isDark ? "text-indigo-400" : "text-indigo-600"}`}>Protected</span>
            </div>
            {/* Floating dots */}
            {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/40"
                    style={{ top: `${15 + i * 12}%`, left: `${10 + (i % 3) * 30}%`, animation: `float ${2 + i * 0.4}s ease-in-out infinite alternate` }} />
            ))}
        </div>
    );
}

function MediaVisual({ isDark }: { isDark: boolean }) {
    const base = isDark ? "bg-slate-800/50" : "bg-white/50";
    const border = isDark ? "border-purple-500/20" : "border-purple-300/30";
    return (
        <div className={`relative w-full aspect-square max-w-sm mx-auto rounded-3xl ${base} backdrop-blur-md border ${border} flex items-center justify-center overflow-hidden`}>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-fuchsia-500/10" />
            {/* Sound wave bars */}
            <div className="relative z-10 flex flex-col items-center gap-4 w-full px-8">
                <div className="flex items-center justify-center gap-2">
                    {[0.4, 0.7, 1, 0.85, 0.6, 0.9, 0.5, 0.75, 1, 0.65].map((h, i) => (
                        <div key={i} className="w-2 rounded-full bg-gradient-to-t from-purple-600 to-fuchsia-400"
                            style={{ height: `${h * 48}px`, animation: `bar ${0.8 + i * 0.1}s ease-in-out infinite alternate`, animationDelay: `${i * 0.08}s` }} />
                    ))}
                </div>
                {/* Fake album art card */}
                <div className={`w-full rounded-2xl p-3 flex items-center gap-3 ${isDark ? "bg-slate-700/50 border border-slate-600/50" : "bg-white/60 border border-slate-200/60"}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className={`h-2 rounded-full mb-1.5 w-3/4 ${isDark ? "bg-slate-500" : "bg-slate-200"}`} />
                        <div className={`h-1.5 rounded-full w-1/2 ${isDark ? "bg-slate-600" : "bg-slate-300"}`} />
                    </div>
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <div className="w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-purple-400 translate-x-0.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function LandingPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const rafRef = useRef<number>(0);
    const scrollVelRef = useRef(0);
    const lastScrollRef = useRef(0);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const isDarkRef = useRef(true);

    const [isDark, setIsDark] = useState(true);
    const [navScrolled, setNavScrolled] = useState(false);

    useEffect(() => { isDarkRef.current = isDark; }, [isDark]);
    const toggleTheme = useCallback(() => setIsDark(d => !d), []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            starsRef.current = createStars(canvas.width, canvas.height);
        };
        resize();
        window.addEventListener("resize", resize);

        const onScroll = () => {
            const y = window.scrollY;
            scrollVelRef.current = y - lastScrollRef.current;
            lastScrollRef.current = y;
            setNavScrolled(y > 20);
        };
        window.addEventListener("scroll", onScroll, { passive: true });

        const onMouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
        window.addEventListener("mousemove", onMouse);

        const draw = () => {
            const { width: W, height: H } = canvas;
            ctx.clearRect(0, 0, W, H);
            const vel = scrollVelRef.current;
            const warp = Math.min(Math.abs(vel) * 1.2, 50);
            scrollVelRef.current *= 0.82;
            const mx = mouseRef.current.x, my = mouseRef.current.y;
            const CURSOR_R = 130;
            const dark = isDarkRef.current;

            const dotRgb = dark ? "210,200,255" : "60,60,200";
            const trailRgb = dark ? "139,120,255" : "59,130,246";

            for (const star of starsRef.current) {
                const moveY = star.speed + warp * (0.3 + star.z * 0.7);
                star.currentY -= moveY;
                if (star.currentY < -20) { star.currentY = H + 10; star.currentX = Math.random() * W; star.x = star.currentX; }

                const dx = star.currentX - mx, dy = star.currentY - my;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let glow = 0;
                if (dist < CURSOR_R && dist > 0) { glow = 1 - dist / CURSOR_R; star.currentX += (dx / dist) * glow * 2; star.currentY += (dy / dist) * glow * 2; }

                const opacity = Math.min(1, star.baseOpacity + glow * 0.7);
                const radius = star.size + glow * 2;

                if (warp > 4) {
                    const trailLen = warp * star.z * 5;
                    const g = ctx.createLinearGradient(star.currentX, star.currentY, star.currentX, star.currentY + trailLen);
                    g.addColorStop(0, `rgba(${trailRgb},${opacity * 0.9})`);
                    g.addColorStop(1, `rgba(${trailRgb},0)`);
                    ctx.beginPath(); ctx.strokeStyle = g; ctx.lineWidth = Math.max(0.5, radius * 0.6);
                    ctx.moveTo(star.currentX, star.currentY); ctx.lineTo(star.currentX, star.currentY + trailLen); ctx.stroke();
                }

                ctx.beginPath();
                if (glow > 0.08) {
                    const grd = ctx.createRadialGradient(star.currentX, star.currentY, 0, star.currentX, star.currentY, radius * 4);
                    grd.addColorStop(0, `rgba(${dark ? "200,180,255" : "79,70,229"},${opacity})`);
                    grd.addColorStop(0.4, `rgba(99,102,241,${opacity * 0.5})`);
                    grd.addColorStop(1, `rgba(99,102,241,0)`);
                    ctx.fillStyle = grd; ctx.arc(star.currentX, star.currentY, radius * 4, 0, Math.PI * 2);
                } else {
                    ctx.fillStyle = `rgba(${dotRgb},${opacity})`; ctx.arc(star.currentX, star.currentY, radius, 0, Math.PI * 2);
                }
                ctx.fill();
            }
            rafRef.current = requestAnimationFrame(draw);
        };
        rafRef.current = requestAnimationFrame(draw);

        return () => {
            cancelAnimationFrame(rafRef.current);
            window.removeEventListener("resize", resize);
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("mousemove", onMouse);
        };
    }, []);

    // ── Theme tokens ──────────────────────────────────────────────────────────
    const bg = isDark ? "bg-[#050508]" : "bg-slate-50";
    const text = isDark ? "text-white" : "text-slate-900";
    const subText = isDark ? "text-slate-400" : "text-slate-500";
    const mutedText = isDark ? "text-slate-500" : "text-slate-400";
    const cardBg = isDark ? "bg-slate-900/40 hover:bg-slate-900/65" : "bg-white/55 hover:bg-white/80";
    const cardBorder = isDark ? "rgba(99,102,241,0.2)" : "rgba(99,102,241,0.25)";
    const divider = isDark ? "border-white/[0.05]" : "border-black/[0.07]";
    const manifesto = isDark ? "text-slate-300" : "text-slate-600";

    const navBg = navScrolled
        ? isDark ? "bg-slate-950/60 backdrop-blur-md border-b border-white/10 shadow-lg shadow-indigo-500/5"
            : "bg-white/75 backdrop-blur-md border-b border-black/10 shadow-lg"
        : "bg-transparent border-b border-transparent";

    const signInBtn = navScrolled
        ? isDark ? "text-indigo-300 hover:text-white border border-indigo-500/40 hover:bg-indigo-500/10"
            : "text-indigo-600 hover:text-indigo-800 border border-indigo-400/50 hover:bg-indigo-50"
        : isDark ? "text-white/70 hover:text-white border border-white/20 hover:bg-white/5"
            : "text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-100";

    const toggleBtn = isDark ? "text-yellow-300 hover:bg-white/10" : "text-slate-500 hover:bg-black/5";

    const ctaPanel = isDark ? "bg-slate-900/50 border-indigo-500/20" : "bg-white/60 border-indigo-300/30";

    return (
        <div className={`relative min-h-screen ${bg} ${text} overflow-x-hidden transition-colors duration-500`}>

            {/* ── Global CSS animations ──────────────────────────────────── */}
            <style>{`
                @keyframes float { from { transform: translateY(0); } to { transform: translateY(-8px); } }
                @keyframes bar   { from { transform: scaleY(0.4); }  to { transform: scaleY(1); } }
            `}</style>

            {/* Canvas */}
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

            {/* Ambient blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className={`absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] ${isDark ? "bg-indigo-700/10" : "bg-indigo-200/30"}`} />
                <div className={`absolute top-[55%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[120px] ${isDark ? "bg-purple-800/10" : "bg-violet-200/20"}`} />
                <div className={`absolute bottom-[5%] left-[-5%] w-[400px] h-[400px] rounded-full blur-[100px] ${isDark ? "bg-indigo-900/10" : "bg-blue-100/30"}`} />
            </div>

            {/* ── NAVBAR ──────────────────────────────────────────────────── */}
            <header className={`fixed top-0 w-full z-50 px-6 md:px-10 py-4 flex justify-between items-center transition-all duration-500 ${navBg}`}>
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent select-none">⬡ Orbit</span>
                <div className="flex items-center gap-3">
                    <button onClick={toggleTheme} aria-label="Toggle theme" className={`p-2 rounded-full transition-all duration-200 ${toggleBtn}`}>
                        {isDark ? <SunIcon /> : <MoonIcon />}
                    </button>
                    <Link href="/login">
                        <button className={`text-sm font-semibold rounded-full px-5 py-2 transition-all duration-300 ${signInBtn}`}>Sign In →</button>
                    </Link>
                </div>
            </header>

            <div className="relative z-10">

                {/* ── SECTION 1: HERO ─────────────────────────────────────── */}
                <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
                    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-10 backdrop-blur-sm ${isDark ? "bg-indigo-950/70 border border-indigo-500/30 text-indigo-300" : "bg-indigo-50/80 border border-indigo-300/50 text-indigo-600"}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Now live — find your signal
                    </div>
                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6 max-w-5xl">
                        <span className={`block bg-clip-text text-transparent bg-gradient-to-r ${isDark ? "from-white via-slate-200 to-indigo-200" : "from-slate-900 via-slate-700 to-indigo-700"}`} style={{ filter: `drop-shadow(0 0 40px rgba(99,102,241,${isDark ? "0.35" : "0.2"}))` }}>
                            Sync Your Vibe.
                        </span>
                        <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent" style={{ filter: `drop-shadow(0 0 60px rgba(139,92,246,${isDark ? "0.5" : "0.35"}))` }}>
                            Find Your Orbit.
                        </span>
                    </h1>
                    <p className={`text-lg md:text-xl max-w-2xl leading-relaxed mb-12 ${subText}`}>
                        The social discovery engine that matches you based on energy, not just aesthetics. Find your people in a universe of noise.
                    </p>
                    <Link href="/login">
                        <button className="group relative px-10 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="absolute -inset-2 bg-indigo-500/25 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 opacity-95 group-hover:opacity-100" />
                            <span className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />
                            <span className="relative flex items-center gap-2.5">
                                Enter the Orbit
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                            </span>
                        </button>
                    </Link>
                    <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-xs animate-bounce select-none ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                        <span className="tracking-widest uppercase text-[10px]">scroll</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                </section>

                {/* ── SECTION 2: MANIFESTO ────────────────────────────────── */}
                <section className={`py-28 px-4 border-t ${divider}`}>
                    <div className="max-w-4xl mx-auto text-center">
                        <p className="text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-8">Why Orbit?</p>
                        <blockquote className={`text-2xl md:text-4xl font-bold leading-snug tracking-tight ${manifesto}`}>
                            <span className={isDark ? "text-white" : "text-slate-900"}>Swiping is dead.</span>{" "}
                            Judging people by a 2D selfie is an outdated algorithm.{" "}
                            <span className={isDark ? "text-white" : "text-slate-900"}>Orbit analyzes your frequency</span>
                            —the music you loop at 2 AM, the aesthetics you curate, the energy you project—to find the people on your{" "}
                            <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent font-black">exact wavelength.</span>
                        </blockquote>
                    </div>
                </section>

                {/* ── SECTION 3: HOW IT WORKS ─────────────────────────────── */}
                <section className={`py-28 px-4 md:px-8 lg:px-16 border-t ${divider}`}>
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">The System</p>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight">How it Works</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { num: "01", icon: "🎵", title: "Set Your Vibe", desc: "Curate your wavelength — music, aesthetics, energy. No filters. No fronting.", glow: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.2)" },
                                { num: "02", icon: "⬡", title: "Enter the Orbit", desc: "Our engine scans for overlapping interests and complementary energies, cutting out the creeps.", glow: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.2)" },
                                { num: "03", icon: "✦", title: "Sync & Connect", desc: "When the vibe is right, the chat unlocks. If the energy shifts, just float away. No drama.", glow: "rgba(217,70,239,0.12)", border: "rgba(217,70,239,0.18)" },
                            ].map(card => (
                                <div key={card.num} className={`group relative backdrop-blur-lg rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 ${cardBg}`} style={{ border: `1px solid ${card.border}` }}>
                                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${card.glow}, transparent 70%)` }} />
                                    <div className="relative">
                                        <div className="text-5xl mb-5">{card.icon}</div>
                                        <div className={`text-[11px] font-bold tracking-[0.2em] uppercase mb-2 ${mutedText}`}>{card.num}</div>
                                        <h3 className="text-xl font-bold mb-3">{card.title}</h3>
                                        <p className={`text-sm leading-relaxed ${subText}`}>{card.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── SECTION 4: FEATURE DEEP-DIVE ────────────────────────── */}
                <section className={`py-28 px-4 md:px-8 lg:px-16 border-t ${divider}`}>
                    <div className="max-w-6xl mx-auto space-y-28">
                        <p className="text-center text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-2">Feature Deep-Dive</p>

                        {/* Feature A — Left text / Right visual */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6 ${isDark ? "bg-indigo-950/70 border border-indigo-500/20 text-indigo-400" : "bg-indigo-50 border border-indigo-200 text-indigo-600"}`}>
                                    🛡️ Feature A
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-5 leading-tight">
                                    Anti-Creep <br />
                                    <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Architecture.</span>
                                </h3>
                                <p className={`text-lg leading-relaxed ${subText}`}>
                                    Your peace is protected. Connections only open when the mutual energy matches. If the vibe shifts, you can silently float away. No ghosting guilt, just natural disconnection.
                                </p>
                                <div className="mt-8 flex flex-col gap-3">
                                    {["Mutual match required to chat", "Silent exit — no awkward goodbyes", "Energy-based compatibility filter"].map(f => (
                                        <div key={f} className="flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                                            <span className={`text-sm ${subText}`}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <ShieldVisual isDark={isDark} />
                        </div>

                        {/* Feature B — Right text / Left visual */}
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <MediaVisual isDark={isDark} />
                            <div>
                                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold mb-6 ${isDark ? "bg-purple-950/70 border border-purple-500/20 text-purple-400" : "bg-purple-50 border border-purple-200 text-purple-600"}`}>
                                    🎵 Feature B
                                </div>
                                <h3 className="text-3xl md:text-4xl font-black tracking-tight mb-5 leading-tight">
                                    Deep Media <br />
                                    <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 bg-clip-text text-transparent">Integration.</span>
                                </h3>
                                <p className={`text-lg leading-relaxed ${subText}`}>
                                    Connect your Spotify, drop your favorite late-night reads, and let your true aesthetic do the talking. Your taste is the algorithm.
                                </p>
                                <div className="mt-8 flex flex-col gap-3">
                                    {["Spotify & Apple Music sync", "Aesthetic board & media drops", "Taste-based compatibility score"].map(f => (
                                        <div key={f} className="flex items-center gap-3">
                                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                                            <span className={`text-sm ${subText}`}>{f}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── SECTION 5: FINAL CTA ────────────────────────────────── */}
                <section className={`py-28 px-4 border-t ${divider}`}>
                    <div className="max-w-3xl mx-auto">
                        <div className={`relative rounded-3xl p-12 md:p-16 text-center backdrop-blur-lg border overflow-hidden ${ctaPanel}`}>
                            {/* Glow core */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/8 pointer-events-none" />
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-indigo-500/15 rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <p className={`text-xs font-bold tracking-[0.3em] uppercase mb-4 ${isDark ? "text-indigo-400" : "text-indigo-500"}`}>The Final Step</p>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
                                    Ready to leave <br />
                                    <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">the void?</span>
                                </h2>
                                <p className={`text-lg mb-10 ${subText}`}>
                                    Join the universe of people who actually get it.
                                </p>
                                <Link href="/login">
                                    <button className="group relative px-10 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95">
                                        <span className="absolute -inset-2 bg-indigo-500/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 opacity-95 group-hover:opacity-100" />
                                        <span className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />
                                        <span className="relative flex items-center gap-2.5">
                                            Claim Your Orbit
                                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </span>
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <p className={`text-center text-xs mt-16 tracking-wider ${isDark ? "text-slate-700" : "text-slate-300"}`}>
                            Orbit · Built for genuine connection
                        </p>
                    </div>
                </section>

            </div>
        </div>
    );
}
