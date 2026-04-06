'use client'

import { useState, useEffect } from 'react'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>
interface UsePlaylistsReturn {
  playlists: Playlist[]
  loading: boolean
  error: string | null
}

export function usePlaylists(): UsePlaylistsReturn {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlaylists() {
      try {
        const res = await fetch('/api/playlists')
        const data = await res.json()
        
        if (data.success && data.data) {
          setPlaylists(data.data)
        } else {
          setError(data.error || 'Error al cargar playlists')
        }
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPlaylists()
  }, [])

  return { playlists, loading, error }
}
