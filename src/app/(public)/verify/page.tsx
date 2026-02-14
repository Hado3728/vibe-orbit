"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function VerifyPage() {
    const router = useRouter();
    const supabase = createClient();
    const hasAttempted = useRef(false);
    const [message, setMessage] = useState("Verifying your magic link...");

    useEffect(() => {
        const verifySession = async () => {
            // 🛑 The Magic Lock: This prevents React Strict Mode from running this twice
            if (hasAttempted.current) return;
            hasAttempted.current = true;

            // Supabase's browser client automatically processes the code in the URL.
            // We just need to check if the session was successfully created.
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                setMessage(`Verification failed: ${error.message}`);
                return;
            }

            if (session) {
                setMessage("Success! Routing you in...");
                // Send them to the dashboard. Our proxy.ts will intercept this
                // and force them to /onboarding since they don't have a username yet!
                router.push("/dashboard");
            } else {
                setMessage("Link expired or invalid. Please try logging in again.");
            }
        };

        verifySession();
    }, [router, supabase]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-purple-100 p-4">
            <Card className="w-full max-w-md bg-white/40 backdrop-blur-xl border-white/50 shadow-2xl rounded-3xl overflow-hidden text-center">
                <CardHeader className="pt-10 pb-4">
                    <CardTitle className="text-3xl font-extrabold text-gray-800 tracking-tight">Orbit</CardTitle>
                </CardHeader>
                <CardContent className="px-8 pb-10">
                    <div className="flex flex-col items-center gap-6">
                        {/* Spinning Loading Circle */}
                        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-700 font-medium">{message}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}