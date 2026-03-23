"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function OrbitTimer({ lastOrbitDrop }: { lastOrbitDrop: string }) {
    const router = useRouter();
    const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const dropTime = new Date(lastOrbitDrop).getTime();
        const targetTime = dropTime + 48 * 60 * 60 * 1000;

        const updateTimer = () => {
            const now = new Date().getTime();
            const difference = targetTime - now;

            if (difference <= 0) {
                // Timer finished!
                setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
                router.refresh();
                return;
            }

            const h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft({ hours: h, minutes: m, seconds: s });
        };

        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        return () => clearInterval(intervalId);
    }, [lastOrbitDrop, router]);

    if (!timeLeft) return <div className="animate-pulse h-32 w-full max-w-sm mx-auto bg-slate-900/50 rounded-3xl border border-slate-800"></div>;

    const pad = (num: number) => num.toString().padStart(2, "0");

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex flex-col items-center justify-center p-8 bg-slate-900/60 backdrop-blur-2xl border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.1)] rounded-3xl max-w-md mx-auto w-full"
        >
            <h3 className="text-slate-400 font-semibold mb-6 tracking-wide uppercase text-sm">Next Orbit Drop In</h3>
            <div className="flex gap-4 sm:gap-6 text-center">
                <div className="flex flex-col items-center">
                    <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-fuchsia-400 to-rose-400 drop-shadow-2xl">
                        {pad(timeLeft.hours)}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 mt-2 tracking-widest">Hours</span>
                </div>
                <span className="text-4xl sm:text-5xl font-bold text-slate-800 animate-pulse mt-1">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-fuchsia-400 to-rose-400 drop-shadow-2xl">
                        {pad(timeLeft.minutes)}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 mt-2 tracking-widest">Minutes</span>
                </div>
                <span className="text-4xl sm:text-5xl font-bold text-slate-800 animate-pulse mt-1">:</span>
                <div className="flex flex-col items-center">
                    <span className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 via-fuchsia-400 to-rose-400 drop-shadow-2xl">
                        {pad(timeLeft.seconds)}
                    </span>
                    <span className="text-[10px] sm:text-xs uppercase font-bold text-slate-500 mt-2 tracking-widest">Seconds</span>
                </div>
            </div>
        </motion.div>
    );
}
