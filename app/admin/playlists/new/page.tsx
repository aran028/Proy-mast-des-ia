'use client'

// Página de creación de playlist — Client Component porque usa estado y eventos de formulario
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getPlaylistIconEmoji,
  PLAYLIST_ICON_OPTIONS,
} from '@/shared/constants/playlist-icons'

export default function NewPlaylistPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState('brain')
  const [selectedColor, setSelectedColor] = useState('#6366f1')

  async function handleSubmit(form: HTMLFormElement) {
    setError('')
    setLoading(true)

    // Recogemos los datos del formulario
    const formData = new FormData(form)
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
      <h1 className="text-xl font-bold text-pink-500 mb-6">Nueva playlist</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          void handleSubmit(e.currentTarget)
        }}
        className="space-y-4"
      >
        {error && (
          <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">{error}</div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm text-pink-400 mb-1">Nombre *</label>
          <input id="name" name="name" required minLength={2}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm text-pink-400 mb-1">Descripción</label>
          <textarea id="description" name="description" rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
        </div>

        <div>
          <label htmlFor="icon" className="block text-sm text-pink-400 mb-1">Icono (emoji)</label>
          <input type="hidden" name="icon" value={selectedIcon} />

          <div id="icon" className="mb-2 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-center text-2xl">
            {getPlaylistIconEmoji(selectedIcon)}
          </div>

          <div className="flex flex-wrap gap-2">
            {PLAYLIST_ICON_OPTIONS.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setSelectedIcon(option.key)}
                aria-label={`Seleccionar ${option.label}`}
                className={`h-10 w-10 rounded-md border text-lg transition-colors ${
                  selectedIcon === option.key
                    ? 'border-pink-500 bg-indigo-500/20'
                    : 'border-zinc-700 bg-zinc-900 hover:border-zinc-500'
                }`}
              >
                {option.emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="color" className="block text-sm text-pink-400 mb-1">Color (hex)</label>
          <div className="flex items-center gap-3">
            <input
              id="color"
              name="color"
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded-md border border-zinc-700 bg-zinc-800 p-1"
            />

            <input
              aria-label="Código HEX"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500"
            />

            <div
              className="h-9 w-9 shrink-0 rounded-md border border-zinc-700"
              style={{ backgroundColor: selectedColor }}
              aria-label={`Color seleccionado ${selectedColor}`}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-pink-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear playlist'}
          </button>
          <button type="button" onClick={() => router.back()}
           className="bg-pink-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
               Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
