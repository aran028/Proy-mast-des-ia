'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'
import Image from 'next/image'
import { usePlaylists } from '@/presentation/hooks'

type Tool = Tables<'tools'>

interface Props {
  tool: Tool
}

export default function EditToolForm({ tool }: Readonly<Props>) {
  const router = useRouter()
  const { playlists, loading: playlistsLoading, error: playlistsError } = usePlaylists()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(tool.image ?? '')
  const [imagePreview, setImagePreview] = useState(tool.image ?? '')
  const [uploadingImage, setUploadingImage] = useState(false)
  const [supportsPrompt, setSupportsPrompt] = useState(tool.supports_prompt ?? false)
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(tool.playlist_id ?? '')

  const getStringValue = (value: FormDataEntryValue | null) =>
    typeof value === 'string' ? value.trim() : ''

  const getValidAbsoluteUrl = (value: string, fieldName: string) => {
    if (!value) return null

    try {
      new URL(value)
      return value
    } catch {
      throw new Error(`La URL de ${fieldName} no es válida. Debe empezar con http:// o https://`)
    }
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      // 1. Crear preview local inmediato (para feedback visual)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)

      // 2. Subir la imagen a Supabase Storage mediante nuestra API
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await res.json()
      
      if (data.success) {
        // 3. Guardar la URL pública devuelta por Supabase
        setImageUrl(data.url)
        setImagePreview(data.url)
        console.log('Imagen subida exitosamente:', data.url)
      } else {
        throw new Error(data.error || 'Error al subir la imagen')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la imagen')
      // Limpiar preview si falla
      setImagePreview(tool.image ?? '')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setImageUrl('')
    setImagePreview('')
  }

  async function handleSubmit(form: HTMLFormElement) {
    setError('')
    setLoading(true)

    const formData = new FormData(form)
    const imageValue = imageUrl.trim()
    const finalImageUrl = imageValue.length > 0 ? imageValue : null
    const websiteValue = getStringValue(formData.get('website'))
    const tagsValue = getStringValue(formData.get('tags'))
    const playlistId = getStringValue(formData.get('playlistId'))

    if (!playlistId) {
      setError('Debes seleccionar una playlist para la tool')
      setLoading(false)
      return
    }

    try {
      const body = {
        name: formData.get('name'),
        summary: formData.get('summary'),
        website: getValidAbsoluteUrl(websiteValue, 'website'),
        image: finalImageUrl && !finalImageUrl.startsWith('data:')
          ? getValidAbsoluteUrl(finalImageUrl, 'la imagen')
          : finalImageUrl,
        playlistId,
        supportsPrompt,
        tags: tagsValue
          ? tagsValue.split(',').map(t => t.trim()).filter(Boolean)
          : [],
      }

      const res = await fetch(`/api/admin/tools/${tool.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar')
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
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void handleSubmit(e.currentTarget)
      }}
      className="space-y-4"
    >
      {(error || playlistsError) && (
        <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">{error || playlistsError}</div>
      )}

      <div>
        <label htmlFor="name" className="block text-md text-pink-500 mb-1">Nombre *</label>
        <input id="name" name="name" required minLength={2} defaultValue={tool.name}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
      </div>

      <div>
        <label htmlFor="summary" className="block text-md text-pink-500 mb-1">Resumen</label>
        <textarea id="summary" name="summary" rows={3} defaultValue={tool.summary ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
      </div>

      <div>
        <label htmlFor="website" className="block text-md text-pink-500 mb-1">Website</label>
        <input 
          id="website"
          name="website" 
          type="text"
          defaultValue={tool.website ?? ''}
          placeholder="https://ejemplo.com"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" 
        />
        <p className="text-xs text-zinc-500 mt-1">Opcional. Debe ser una URL válida si se proporciona.</p>
      </div>

      <div>
        <label htmlFor="playlistId" className="block text-md text-pink-500 mb-1">Playlist *</label>
        <select
          id="playlistId"
          name="playlistId"
          required
          value={selectedPlaylistId}
          onChange={(e) => setSelectedPlaylistId(e.target.value)}
          disabled={playlistsLoading || playlists.length === 0}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500 disabled:opacity-50"
        >
          <option value="">
            {playlistsLoading ? 'Cargando playlists...' : 'Selecciona una playlist'}
          </option>
          {playlists.map((playlist) => (
            <option key={playlist.id} value={playlist.id}>{playlist.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="image-url" className="block text-md text-pink-500 mb-2">Imagen</label>
        
        {/* Preview de la imagen */}
        {imagePreview && (URL.canParse(imagePreview) || imagePreview.startsWith('data:')) && (
          <div className="mb-3 relative inline-block w-32 h-32">
            <Image
              src={imagePreview}
              alt="Preview"
              fill
              className="object-cover rounded-lg border border-zinc-700"
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Selector de archivo */}
        <div className="flex gap-2">
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white rounded-md px-4 py-2 text-sm transition-colors">
              <Upload className="w-4 h-4" />
              {uploadingImage ? 'Cargando...' : 'Seleccionar imagen'}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={uploadingImage}
              className="hidden"
            />
          </label>
        </div>

        {/* Campo de URL manual (alternativa) */}
        <div className="mt-2">
          <input 
            id="image-url"
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setImagePreview(e.target.value)
            }}
            placeholder="O pega una URL: https://ejemplo.com/imagen.jpg"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" 
          />
        </div>
        
        <p className="text-xs text-zinc-500 mt-1">
          Puedes subir una imagen desde tu computadora o pegar una URL externa.
        </p>
      </div>

      <div>
        {/* Los tags se muestran como string separado por comas para edición fácil */}
        <label htmlFor="tags" className="block text-md text-pink-500 mb-1">Tags (separados por comas)</label>
        <input id="tags" name="tags" defaultValue={tool.tags?.join(', ') ?? ''}
          placeholder="AI, Machine Learning, NLP"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-pink-500" />
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input
          id="supportsPrompt"
          type="checkbox"
          checked={supportsPrompt}
          onChange={(e) => setSupportsPrompt(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-pink-500 focus:ring-pink-500"
        />
        <label htmlFor="supportsPrompt" className="text-sm text-zinc-300">
          <span className='block text-md text-pink-400' >Esta herramienta funciona con prompts</span>
          <span className="block text-xs text-zinc-500">Marca esta opción si la herramienta acepta prompts de texto. Aparecerá en la sección Prompt Generator.</span>
        </label>
      </div>

      <div className="flex gap-3 pt-2 justify-center">
        <button type="submit" disabled={loading || uploadingImage}
          className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button type="button" onClick={() => router.back()}

         className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-4 py-2 rounded-md disabled:opacity-50">
                   Cancelar
        </button>
      </div>
    </form>
  )
}
