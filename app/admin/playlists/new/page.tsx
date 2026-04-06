'use client'

// Página de creación de playlist — Client Component porque usa estado y eventos de formulario
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewPlaylistPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Recogemos los datos del formulario
    const formData = new FormData(e.currentTarget)
    const body = {
      name: formData.get('name'),
      description: formData.get('description'),
      icon: formData.get('icon'),
      color: formData.get('color'),
    }

    try {
      // Llamamos a la API route POST /api/admin/playlists
      const res = await fetch('/api/admin/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear la playlist')
      }

      // Redirigimos al listado tras crear
      router.push('/admin/playlists')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Nueva playlist</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Nombre *</label>
          <input name="name" required minLength={2}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Descripción</label>
          <textarea name="description" rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Icono (emoji)</label>
          <input name="icon" placeholder="🤖"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Color (hex)</label>
          <input name="color" placeholder="#6366f1"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear playlist'}
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
