'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>
type Tool = Tables<'tools'>

export default function NewVideoPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [tools, setTools] = useState<Tool[]>([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState('')

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
      description: formData.get('description') || undefined,
      thumbnailUrl: formData.get('thumbnailUrl') || undefined,
      author: formData.get('author') || undefined,
      authorUrl: formData.get('authorUrl') || undefined,
      playlistId: formData.get('playlistId') || undefined,
      toolId: formData.get('toolId') || undefined,
      tags: formData.get('tags')
        ? String(formData.get('tags')).split(',').map(t => t.trim()).filter(Boolean)
        : [],
    }

    try {
      const res = await fetch('/api/admin/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear el video')
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
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Nuevo video</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Título *</label>
          <input name="title" required minLength={3}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">URL del video *</label>
          <input name="videoUrl" required type="url" placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Plataforma *</label>
            <select name="platform" required
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">ID de plataforma *</label>
            <input name="platformVideoId" required placeholder="dQw4w9WgXcQ"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Descripción</label>
          <textarea name="description" rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Thumbnail URL</label>
          <input name="thumbnailUrl" type="url" placeholder="https://img.youtube.com/vi/.../hqdefault.jpg"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400 mb-1">Autor</label>
            <input name="author"
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-sm text-zinc-400 mb-1">URL del autor</label>
            <input name="authorUrl" type="url" placeholder="https://youtube.com/channel/..."
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
            <select name="toolId"
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
          <input name="tags" placeholder="ai, coding, tutorial"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear video'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="text-zinc-400 hover:text-white text-sm px-4 py-2">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
