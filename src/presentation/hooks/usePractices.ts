'use client'

import { useState, useEffect } from 'react'
import type { Tables } from '@/shared/types/database.types'

type Practice = Tables<'practices'>
interface UsePracticesReturn {
  practices: Practice[]
  loading: boolean
  error: string | null
}

export function usePractices(playlistId?: string): UsePracticesReturn {
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPractices() {
      try {
        const url = playlistId 
          ? `/api/practices?playlist=${playlistId}` 
          : '/api/practices'
        const res = await fetch(url)
        const data = await res.json()
        
        if (data.success && data.data) {
          setPractices(data.data)
        } else {
          setError(data.error || 'Error al cargar practices')
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error desconocido'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchPractices()
  }, [playlistId])

  return { practices, loading, error }
}
