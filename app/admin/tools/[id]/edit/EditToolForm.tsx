'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

interface Props {
  tool: Tool
}

export default function EditToolForm({ tool }: Props) {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState(tool.image ?? '')
  const [imagePreview, setImagePreview] = useState(tool.image ?? '')
  const [uploadingImage, setUploadingImage] = useState(false)

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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Validar y limpiar la URL de imagen
    const imageValue = imageUrl.trim()
    const finalImageUrl = imageValue && imageValue.length > 0 ? imageValue : null
    
    // Validar que si hay imagen URL (no data URL), sea una URL válida
    if (finalImageUrl && !finalImageUrl.startsWith('data:') && finalImageUrl.startsWith('http')) {
      const isAbsoluteUrl = finalImageUrl.startsWith('http://') || finalImageUrl.startsWith('https://')
      
      if (isAbsoluteUrl) {
        try {
          new URL(finalImageUrl)
        } catch {
          setError('La URL de la imagen no es válida. Debe ser una URL completa (http:// o https://)')
          setLoading(false)
          return
        }
      }
    }

    // Validar y limpiar la URL del website
    const websiteValue = (formData.get('website') as string)?.trim()
    const websiteUrl = websiteValue && websiteValue.length > 0 ? websiteValue : null
    
    if (websiteUrl) {
      // Website debe ser una URL absoluta
      try {
        new URL(websiteUrl)
      } catch {
        setError('La URL del website no es válida. Debe empezar con http:// o https://')
        setLoading(false)
        return
      }
    }

    const body = {
      name: formData.get('name'),
      summary: formData.get('summary'),
      website: websiteUrl,
      image: finalImageUrl,
      tags: formData.get('tags')
        ? String(formData.get('tags')).split(',').map(t => t.trim()).filter(Boolean)
        : [],
    }

    try {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 text-red-400 p-3 rounded-md text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Nombre *</label>
        <input name="name" required minLength={2} defaultValue={tool.name}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Resumen</label>
        <textarea name="summary" rows={3} defaultValue={tool.summary ?? ''}
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-1">Website</label>
        <input 
          name="website" 
          type="text"
          defaultValue={tool.website ?? ''}
          placeholder="https://ejemplo.com"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" 
        />
        <p className="text-xs text-zinc-500 mt-1">Opcional. Debe ser una URL válida si se proporciona.</p>
      </div>

      <div>
        <label className="block text-sm text-zinc-400 mb-2">Imagen</label>
        
        {/* Preview de la imagen */}
        {imagePreview && (
          <div className="mb-3 relative inline-block">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="w-32 h-32 object-cover rounded-lg border border-zinc-700"
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
            type="text"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value)
              setImagePreview(e.target.value)
            }}
            placeholder="O pega una URL: https://ejemplo.com/imagen.jpg"
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" 
          />
        </div>
        
        <p className="text-xs text-zinc-500 mt-1">
          Puedes subir una imagen desde tu computadora o pegar una URL externa.
        </p>
      </div>

      <div>
        {/* Los tags se muestran como string separado por comas para edición fácil */}
        <label className="block text-sm text-zinc-400 mb-1">Tags (separados por comas)</label>
        <input name="tags" defaultValue={tool.tags?.join(', ') ?? ''}
          placeholder="AI, Machine Learning, NLP"
          className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading || uploadingImage}
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
