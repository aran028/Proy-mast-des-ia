'use client'

import { useState, useEffect } from 'react'

export interface Video {
  id: string
  title: string
  description: string | null
  videoUrl: string
  platformVideoId: string
  platform: string
  thumbnailUrl: string | null
  author: string | null
  authorUrl: string | null
  duration: number | null
  viewCount: number | null
  publishedAt: string | null
  tags: string[] | null
  aiClassified: boolean | null
  classificationConfidence: number | null
  status: string | null
  playlistId: string | null
  toolId: string | null
  createdAt: string | null
  updatedAt: string | null
}

interface UseVideosReturn {
  videos: Video[]
  loading: boolean
  error: string | null
}

export function useVideos(playlistId?: string, toolId?: string): UseVideosReturn {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        setLoading(true)
        setError(null)

        const params = new URLSearchParams()
        if (playlistId) params.set('playlistId', playlistId)
        if (toolId) params.set('toolId', toolId)

        const query = params.toString()
        const url = query ? `/api/videos?${query}` : '/api/videos'
        const res = await fetch(url)
        const data = await res.json()

        if (data.success && data.data) {
          setVideos(data.data)
        } else {
          setError(data.error || 'Error al cargar videos')
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : 'Error al cargar videos'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [playlistId, toolId])

  return { videos, loading, error }
}
