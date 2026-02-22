'use client'

import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
    const [report, setReport] = useState<Record<string, string>>({})

    useEffect(() => {
        const run = async () => {
            const results: Record<string, string> = {}

            // 1. Check env vars
            results['NEXT_PUBLIC_SUPABASE_URL'] = process.env.NEXT_PUBLIC_SUPABASE_URL
                ? `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30)}...)`
                : '❌ MISSING'
            results['NEXT_PUBLIC_SUPABASE_ANON_KEY'] = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                ? `✅ Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20)}...)`
                : '❌ MISSING'

            // 2. Check createBrowserClient import
            try {
                const { createBrowserClient } = await import('@supabase/ssr')
                results['@supabase/ssr import'] = `✅ OK (type: ${typeof createBrowserClient})`

                // 3. Try calling it with dummy values
                try {
                    const client = createBrowserClient(
                        'https://placeholder.supabase.co',
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
                    )
                    results['createBrowserClient()'] = `type: ${typeof client}`
                    results['client.auth'] = client?.auth ? `✅ exists (type: ${typeof client.auth})` : '❌ undefined / null'
                    results['client.auth.signInWithOAuth'] = typeof client?.auth?.signInWithOAuth === 'function' ? '✅ function' : `❌ ${typeof client?.auth?.signInWithOAuth}`
                } catch (e: any) {
                    results['createBrowserClient() threw'] = e.message
                }

                // 4. Try with REAL env vars if available
                const url = process.env.NEXT_PUBLIC_SUPABASE_URL
                const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                if (url && key) {
                    try {
                        const realClient = createBrowserClient(url, key)
                        results['Real client.auth'] = realClient?.auth ? '✅ exists' : '❌ undefined'
                        const { data, error } = await realClient.auth.getSession()
                        results['getSession()'] = error ? `❌ ${error.message}` : `✅ session: ${data.session ? 'active' : 'none'}`
                    } catch (e: any) {
                        results['Real client threw'] = e.message
                    }
                }
            } catch (e: any) {
                results['@supabase/ssr import FAILED'] = e.message
            }

            setReport(results)
        }
        run()
    }, [])

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-mono">
            <h1 className="text-2xl font-bold mb-6">🔍 Supabase Diagnostic</h1>
            {Object.keys(report).length === 0 ? (
                <p className="text-gray-400">Running checks...</p>
            ) : (
                <div className="space-y-2">
                    {Object.entries(report).map(([key, value]) => (
                        <div key={key} className="flex gap-4 border-b border-slate-700 pb-2">
                            <span className="text-gray-400 w-64 shrink-0">{key}</span>
                            <span className={value.startsWith('✅') ? 'text-green-400' : value.startsWith('❌') ? 'text-red-400' : 'text-yellow-300'}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
