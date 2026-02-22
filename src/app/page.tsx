"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Star {
    x: number; y: number; z: number;
    size: number; baseOpacity: number; speed: number;
    currentX: number; currentY: number;
}

const STAR_COUNT = 220;

function createStars(w: number, h: number): Star[] {
    return Array.from({ length: STAR_COUNT }, () => {
        const x = Math.random() * w, y = Math.random() * h;
        return { x, y, currentX: x, currentY: y, z: Math.random(), size: Math.random() * 1.8 + 0.3, baseOpacity: Math.random() * 0.6 + 0.2, speed: Math.random() * 0.25 + 0.05 };
    });
}

export default function LandingPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const rafRef = useRef<number>(0);
    const scrollVelRef = useRef(0);
    const lastScrollRef = useRef(0);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const [navScrolled, setNavScrolled] = useState(false);

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
                    const grad = ctx.createLinearGradient(star.currentX, star.currentY, star.currentX, star.currentY + trailLen);
                    grad.addColorStop(0, `rgba(139,120,255,${opacity * 0.9})`);
                    grad.addColorStop(1, `rgba(139,120,255,0)`);
                    ctx.beginPath(); ctx.strokeStyle = grad; ctx.lineWidth = Math.max(0.5, radius * 0.6);
                    ctx.moveTo(star.currentX, star.currentY); ctx.lineTo(star.currentX, star.currentY + trailLen); ctx.stroke();
                }

                ctx.beginPath();
                if (glow > 0.08) {
                    const grd = ctx.createRadialGradient(star.currentX, star.currentY, 0, star.currentX, star.currentY, radius * 4);
                    grd.addColorStop(0, `rgba(200,180,255,${opacity})`);
                    grd.addColorStop(0.4, `rgba(99,102,241,${opacity * 0.5})`);
                    grd.addColorStop(1, `rgba(99,102,241,0)`);
                    ctx.fillStyle = grd; ctx.arc(star.currentX, star.currentY, radius * 4, 0, Math.PI * 2);
                } else {
                    ctx.fillStyle = `rgba(210,200,255,${opacity})`; ctx.arc(star.currentX, star.currentY, radius, 0, Math.PI * 2);
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

    return (
        <div className="relative min-h-screen bg-[#050508] text-white overflow-x-hidden">

            {/* Canvas starfield */}
            <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />

            {/* Ambient glow blobs */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-700/10 rounded-full blur-[140px]" />
                <div className="absolute top-[60%] right-[-5%] w-[500px] h-[500px] bg-purple-800/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-indigo-900/10 rounded-full blur-[100px]" />
            </div>

            {/* ── Scroll-aware Navbar ──────────────────────────────────────── */}
            <header
                className={`fixed top-0 w-full z-50 px-6 md:px-10 py-4 flex justify-between items-center transition-all duration-500 ${navScrolled
                        ? "bg-slate-950/60 backdrop-blur-md border-b border-white/10 shadow-lg shadow-indigo-500/5"
                        : "bg-transparent border-b border-transparent"
                    }`}
            >
                <span className="font-black text-xl tracking-tight bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent select-none">
                    ⬡ Orbit
                </span>
                <Link href="/login">
                    <button className={`text-sm font-semibold rounded-full px-5 py-2 transition-all duration-300 ${navScrolled
                            ? "text-indigo-300 hover:text-white border border-indigo-500/40 hover:border-indigo-400/80 hover:bg-indigo-500/10 backdrop-blur-sm"
                            : "text-white/70 hover:text-white border border-white/20 hover:border-white/40 hover:bg-white/5"
                        }`}>
                        Sign In →
                    </button>
                </Link>
            </header>

            {/* ── Content ─────────────────────────────────────────────────── */}
            <div className="relative z-10">

                {/* Hero */}
                <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
                    <div className="inline-flex items-center gap-2 bg-indigo-950/70 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-semibold text-indigo-300 mb-10 backdrop-blur-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                        Now live — find your signal
                    </div>

                    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] mb-6 max-w-5xl">
                        <span className="block bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 40px rgba(99,102,241,0.35))" }}>
                            Sync Your Vibe.
                        </span>
                        <span className="block mt-2 bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 60px rgba(139,92,246,0.5))" }}>
                            Find Your Orbit.
                        </span>
                    </h1>

                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed mb-12">
                        The social discovery engine that matches you based on energy, not just aesthetics.{" "}
                        Find your people in a universe of noise.
                    </p>

                    <Link href="/login">
                        <button className="group relative px-10 py-4 rounded-2xl font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95">
                            <span className="absolute -inset-2 bg-indigo-500/25 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 opacity-95 group-hover:opacity-100 transition-opacity" />
                            <span className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]" />
                            <span className="relative flex items-center gap-2.5">
                                Enter the Orbit
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        </button>
                    </Link>

                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-600 text-xs animate-bounce select-none">
                        <span className="tracking-widest uppercase text-[10px]">scroll</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-32 px-4 md:px-8 lg:px-16">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-indigo-400 text-xs font-bold tracking-[0.3em] uppercase mb-4">The System</p>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">How it Works</h2>
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { num: "01", icon: "🎵", title: "Set Your Vibe", desc: "Build a profile based on your current wavelength, music, and late-night aesthetics. No filters. No fronting.", glow: "rgba(99,102,241,0.15)", border: "rgba(99,102,241,0.2)" },
                                { num: "02", icon: "⬡", title: "Enter the Orbit", desc: "Our engine scans the network for overlapping interests and complementary energies, cutting out the creeps.", glow: "rgba(139,92,246,0.15)", border: "rgba(139,92,246,0.2)" },
                                { num: "03", icon: "✦", title: "Sync & Connect", desc: "When the vibe is right, the chat unlocks. If the energy shifts, just float away. No pressure. No drama.", glow: "rgba(217,70,239,0.12)", border: "rgba(217,70,239,0.18)" },
                            ].map((card) => (
                                <div key={card.num} className="group relative bg-slate-900/40 backdrop-blur-lg rounded-3xl p-8 overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:bg-slate-900/60" style={{ border: `1px solid ${card.border}` }}>
                                    <div className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-300" style={{ background: `radial-gradient(circle, ${card.glow}, transparent 70%)` }} />
                                    <div className="relative">
                                        <div className="text-5xl mb-5">{card.icon}</div>
                                        <div className="text-[11px] font-bold text-slate-500 tracking-[0.2em] uppercase mb-2">{card.num}</div>
                                        <h3 className="text-xl font-bold text-white mb-3">{card.title}</h3>
                                        <p className="text-slate-400 text-sm leading-relaxed">{card.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Footer CTA */}
                <section className="py-28 px-4 text-center border-t border-white/[0.04]">
                    <p className="text-slate-600 text-xs tracking-[0.3em] uppercase mb-8">Ready to find your signal?</p>
                    <Link href="/login">
                        <button className="group text-indigo-400 hover:text-white font-semibold text-xl transition-all duration-200">
                            <span className="underline underline-offset-4 decoration-indigo-500/40 group-hover:decoration-indigo-400 transition-colors">Join the Orbit</span>
                            <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
                        </button>
                    </Link>
                    <p className="text-slate-700 text-xs mt-20 tracking-wider">Orbit · Built for genuine connection</p>
                </section>
            </div>
        </div>
    );
}
