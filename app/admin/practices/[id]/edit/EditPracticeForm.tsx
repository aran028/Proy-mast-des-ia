'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/shared/types/database.types'

type Practice = Tables<'practices'>
type Playlist = Tables<'playlists'>
type Tool = Tables<'tools'>

const PRACTICE_TYPES = ['rag', 'automation', 'extraction', 'tutorial']

interface Props {
  practice: Practice
}

export default function EditPracticeForm({ practice }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [allTools, setAllTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>(practice.playlist_id ?? '')

  useEffect(() => {
    // Cargar playlists y tools disponibles
    async function loadData() {
      try {
        const [playlistsRes, toolsRes] = await Promise.all([
          fetch('/api/playlists'),
          fetch('/api/tools')
        ])
        
        const playlistsData = await playlistsRes.json()
        const toolsData = await toolsRes.json()
        
        if (playlistsData.success) setPlaylists(playlistsData.data)
        if (toolsData.success) {
          setAllTools(toolsData.data)
          // Filtrar tools inicialmente si hay una playlist seleccionada
          if (practice.playlist_id) {
            const filtered = toolsData.data.filter((tool: Tool) => tool.playlist_id === practice.playlist_id)
            setFilteredTools(filtered)
          } else {
            setFilteredTools(toolsData.data)
          }
        }
      } catch (err) {
        console.error('Error loading data:', err)
      }
    }
    
    loadData()
  }, [practice.playlist_id])

  // Filtrar tools cuando cambia la playlist seleccionada
  useEffect(() => {
    if (selectedPlaylistId) {
      const filtered = allTools.filter(tool => tool.playlist_id === selectedPlaylistId)
      setFilteredTools(filtered)
    } else {
      setFilteredTools(allTools)
    }
  }, [selectedPlaylistId, allTools])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const playlistId = formData.get('playlistId') as string
    const toolId = formData.get('toolId') as string
    
    const body = {
      title: formData.get('title'),
      description: formData.get('description'),
      type: formData.get('type') || null,
      playlistId: playlistId && playlistId.length > 0 ? playlistId : null,
      toolId: toolId && toolId.length > 0 ? toolId : null,
    }

    try {
      const res = await fetch(`/api/admin/practices/${practice.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      router.push('/admin/practices')
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
        <label className="block text-sm text-zinc-400 mb-1">Título *</label>
        <input name="title" required minLength={3} defaultValue={practice.title}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Descripción</label>
        <textarea name="description" rows={3} defaultValue={practice.description ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Tipo</label>
        <select name="type" defaultValue={practice.type ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          <option value="">Sin tipo</option>
          {PRACTICE_TYPES.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Playlist</label>
        <select 
          name="playlistId" 
          value={selectedPlaylistId}
          onChange={(e) => setSelectedPlaylistId(e.target.value)}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          <option value="">Sin playlist</option>
          {playlists.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 mt-1">Opcional. Categoría a la que pertenece esta práctica.</p>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Tool</label>
        <select name="toolId" defaultValue={practice.tool_id ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
          <option value="">Sin tool</option>
          {filteredTools.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <p className="text-xs text-zinc-500 mt-1">
          {selectedPlaylistId 
            ? `Mostrando ${filteredTools.length} tool(s) de la playlist seleccionada.`
            : 'Opcional. Herramienta utilizada en esta práctica.'}
        </p>
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
