'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
    const [status, setStatus] = useState('Connecting...')
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const testConnection = async () => {
            try {
                const supabase = createClient()
                console.log('Testing Supabase connection...')

                // This might return empty array if RLS is on and user is anon, 
                // but it proves connection works if it doesn't throw network error.
                const { data, error } = await supabase.from('rooms').select('*')

                if (error) {
                    console.error('Supabase Error:', error)
                    setStatus('Error connecting (check console)')
                } else {
                    console.log('Supabase Data:', data)
                    setData(data)
                    setStatus('Supabase Connected')
                }
            } catch (err) {
                console.error('Unexpected Error:', err)
                setStatus('Unexpected Error')
            }
        }

        testConnection()
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center flex-col gap-4">
            <h1 className="text-2xl font-bold">Supabase Connection Test</h1>
            <div className={`p-4 rounded-md ${status === 'Supabase Connected' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {status}
            </div>
            <pre className="bg-gray-100 p-4 rounded-md text-xs max-w-lg overflow-auto">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    )
}
