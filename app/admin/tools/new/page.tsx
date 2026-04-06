'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewToolPage() {
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
      summary: formData.get('summary'),
      website: formData.get('website'),
      image: formData.get('image'),
      // Convertimos el string de tags separados por comas en array
      tags: formData.get('tags')
        ? String(formData.get('tags')).split(',').map(t => t.trim()).filter(Boolean)
        : [],
    }

    try {
      const res = await fetch('/api/admin/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear la tool')
      }

      router.push('/admin/tools')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Nueva tool</h1>

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
          <label className="block text-sm text-zinc-400 mb-1">Resumen</label>
          <textarea name="summary" rows={3}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Website</label>
          <input name="website" type="url" placeholder="https://..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Imagen (URL)</label>
          <input name="image" type="url" placeholder="https://..."
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div>
          <label className="block text-sm text-zinc-400 mb-1">Tags (separados por comas)</label>
          <input name="tags" placeholder="nlp, chat, openai"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
            {loading ? 'Creando...' : 'Crear tool'}
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
