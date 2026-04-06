'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'

export function useIsAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        console.log('[useIsAdmin] No user found')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        console.log('[useIsAdmin] Checking admin status for user:', user.email)
        const res = await fetch('/api/auth/check-admin')
        const data = await res.json()
        console.log('[useIsAdmin] Response:', data)
        setIsAdmin(data.isAdmin || false)
      } catch (error) {
        console.error('[useIsAdmin] Error checking admin status:', error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdmin()
  }, [user?.id])


  return { isAdmin, loading }
}
