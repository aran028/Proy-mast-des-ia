'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>
type Tool = Tables<'tools'>

interface VideoData {
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
  status: string
  playlistId: string | null
  toolId: string | null
}

interface Props {
  video: VideoData
}

export default function EditVideoForm({ video }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(video.playlistId ?? '')

  useEffect(() => {
    fetch('/api/playlists').then(r => r.json()).then(d => {
      if (d.success) setPlaylists(d.data)
    })
    fetch('/api/tools').then(r => r.json()).then(d => {
      if (d.success) setTools(d.data)
    })
  }, [])

  const filteredTools = selectedPlaylistId
    ? tools.filter(t => t.playlist_id === selectedPlaylistId)
    : tools

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const body = {
      title: formData.get('title'),
      videoUrl: formData.get('videoUrl'),
      platform: formData.get('platform'),
      platformVideoId: formData.get('platformVideoId'),
      description: formData.get('description') || null,
      thumbnailUrl: formData.get('thumbnailUrl') || null,
      author: formData.get('author') || null,
      authorUrl: formData.get('authorUrl') || null,
      status: formData.get('status'),
      playlistId: formData.get('playlistId') || null,
      toolId: formData.get('toolId') || null,
      tags: formData.get('tags')
        ? String(formData.get('tags')).split(',').map(t => t.trim()).filter(Boolean)
        : [],
    }

    try {
      const res = await fetch(`/api/admin/videos/${video.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      router.push('/admin/videos')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Estado</label>
        <select name="status" defaultValue={video.status}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          <option value="approved">Aprobado</option>
          <option value="pending">Pendiente</option>
          <option value="rejected">Rechazado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Título *</label>
        <input name="title" required minLength={3} defaultValue={video.title}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">URL del video *</label>
        <input name="videoUrl" required type="url" defaultValue={video.videoUrl}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Plataforma</label>
          <select name="platform" defaultValue={video.platform}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">ID de plataforma</label>
          <input name="platformVideoId" required defaultValue={video.platformVideoId}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Descripción</label>
        <textarea name="description" rows={3} defaultValue={video.description ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Thumbnail URL</label>
        <input name="thumbnailUrl" type="url" defaultValue={video.thumbnailUrl ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Autor</label>
          <input name="author" defaultValue={video.author ?? ''}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">URL del autor</label>
          <input name="authorUrl" type="url" defaultValue={video.authorUrl ?? ''}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Playlist</label>
          <select name="playlistId"
            value={selectedPlaylistId}
            onChange={(e) => setSelectedPlaylistId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            <option value="">Sin playlist</option>
            {playlists.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-zinc-400 mb-1">Tool</label>
          <select name="toolId" defaultValue={video.toolId ?? ''}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            <option value="">Sin tool</option>
            {filteredTools.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Tags (separados por comas)</label>
        <input name="tags" defaultValue={video.tags?.join(', ') ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-zinc-400 hover:text-white text-sm px-4 py-2">
          Cancelar
        </button>
      </div>
    </form>
  )
}
