"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
    const [mounted, setMounted] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Wait for hydration to finish before checking localStorage
        const consent = localStorage.getItem("vibe_orbit_cookie_consent");
        if (!consent) {
            setShowBanner(true);
        }
    }, []);

    const handleConsent = (accepted: boolean) => {
        localStorage.setItem("vibe_orbit_cookie_consent", accepted ? "accepted" : "declined");
        setShowBanner(false);
        // Optional: Trigger your exact GDPR scripts or disable analytics here based on 'accepted'
    };

    if (!mounted) return null;

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 200, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 200, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 pb-8 md:p-8 pointer-events-none"
                >
                    <div className="max-w-4xl mx-auto bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/50 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h3 className="text-xl font-bold text-slate-100 tracking-tight">Vibe Consistency</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                We use cookies to keep you logged in securely and strictly match your vibes with the best possible people. We never sell your data.
                            </p>
                        </div>
                        <div className="flex flex-row gap-4 w-full md:w-auto">
                            <button
                                onClick={() => handleConsent(false)}
                                className="flex-1 md:flex-none px-6 py-3 rounded-xl border border-slate-700 bg-transparent hover:bg-slate-800 text-slate-300 font-semibold transition-all active:scale-95"
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => handleConsent(true)}
                                className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                            >
                                Accept
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
