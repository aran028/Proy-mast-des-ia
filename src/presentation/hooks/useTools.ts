'use client'

import { useState, useEffect } from 'react'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>
interface UseToolsReturn {
  tools: Tool[]
  loading: boolean
  error: string | null
}

export function useTools(playlistId?: string): UseToolsReturn {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTools() {
      try {
        const url = playlistId 
          ? `/api/tools?playlist=${playlistId}` 
          : '/api/tools'
        const res = await fetch(url)
        const data = await res.json()
        
        if (data.success && data.data) {
          setTools(data.data)
        } else {
          setError(data.error || 'Error al cargar tools')
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTools()
  }, [playlistId])

  return { tools, loading, error }
}
