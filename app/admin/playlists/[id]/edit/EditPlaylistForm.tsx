'use client'

// Formulario de edición separado en Client Component para manejar estado y submit
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>

interface Props {
  playlist: Playlist
}

export default function EditPlaylistForm({ playlist }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      description: formData.get('description'),
      icon: formData.get('icon'),
      color: formData.get('color'),
    }

    try {
      // PATCH a la API route con el id de la playlist
      const res = await fetch(`/api/admin/playlists/${playlist.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
      }

      router.push('/admin/playlists')
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
        <label className="block text-sm text-zinc-400 mb-1">Nombre *</label>
        <input name="name" required minLength={2} defaultValue={playlist.name}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Descripción</label>
        <textarea name="description" rows={3} defaultValue={playlist.description ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Icono (emoji)</label>
        <input name="icon" defaultValue={playlist.icon ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Color (hex)</label>
        <input name="color" defaultValue={playlist.color ?? ''}
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
