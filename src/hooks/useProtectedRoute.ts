import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useUser } from './useUser'

export function useProtectedRoute() {
    const { user, loading } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    return { user, loading }
}
