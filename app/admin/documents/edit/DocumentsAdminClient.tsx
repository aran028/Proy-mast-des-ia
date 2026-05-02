'use client'

import { useState } from 'react'
import { Button } from '@/presentation/components/ui/button'
import type { DocumentRecord } from '@/application/ports/repositories'
import { Trash2 } from 'lucide-react';

interface Props {
  initialDocuments: DocumentRecord[]
}

export function DocumentsAdminClient({ initialDocuments }: Props) {
  const [documents, setDocuments] = useState<DocumentRecord[]>(initialDocuments)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [reindexing, setReindexing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function refreshList() {
    const res = await fetch('/api/admin/documents')
    const json = await res.json()
    if (json.success) setDocuments(json.data)
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    setMessage(null)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      if (title.trim()) formData.append('title', title.trim())

      const res = await fetch('/api/admin/documents', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Upload failed')

      setMessage(`Documento indexado: ${json.chunksIndexed} chunks`)
      setTitle('')
      setFile(null)
      const fileInput = document.getElementById('file-input') as HTMLInputElement | null
      if (fileInput) fileInput.value = ''
      await refreshList()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este documento y todos sus chunks?')) return
    setError(null)
    try {
      const res = await fetch(`/api/admin/documents/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Delete failed')
      setDocuments((prev) => prev.filter((d) => d.id !== id))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    }
  }

  async function handleReindex() {
    if (!confirm('Reindexar todo el catálogo (tools, playlists, videos)?')) return
    setReindexing(true)
    setMessage(null)
    setError(null)
    try {
      const res = await fetch('/api/admin/chat/reindex-catalog', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Reindex failed')
      setMessage(
        `Catálogo reindexado: ${json.toolsIndexed} tools, ${json.playlistsIndexed} playlists, ${json.videosIndexed} videos`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setReindexing(false)
    }
  }

  return (
    <div>
    <div className="flex items-center justify-between mb-6">        
        <h1 className="text-xl font-bold text-pink-500">Catálogo y Documentos del Chatbot</h1>
     </div>

      <section className="rounded-lg border border-pink-500 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-pink-500">Catálogo</h2>
        <p className="mt-1 text-md text-zinc-400">
          Reindexa playlists, tools y videos cuando se han añadido nuevos elementos.
        </p>
        <Button
          onClick={handleReindex}
          disabled={reindexing}
          className="mt-3 bg-pink-500 hover:bg-indigo-700"
   
        >
          {reindexing ? 'Reindexando…' : 'Reindexar catálogo'}
        </Button>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-lg font-semibold text-pink-500">Subir documento</h2>
          <p className="mt-1 text-md text-zinc-400">
          Sube PDF, MD o TXT para que el chatbot pueda responder sobre ellos.
        </p>
        <form onSubmit={handleUpload} className="mt-3 space-y-3">
          <input
            type="text"
            placeholder="Título (opcional, por defecto el nombre del archivo)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:text-pink-500"
          />
          <input
            id="file-input"
            type="file"
            accept=".pdf,.md,.txt,application/pdf,text/markdown,text/plain"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-pink-500 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-pink-700"
          />
          <Button type="submit" disabled={!file || uploading}>
            {uploading ? 'Subiendo…' : 'Subir e indexar'}
          </Button>
        </form>
      </section>

      {message && (
        <p className="rounded-md bg-emerald-950 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-md bg-red-950 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-pink-500 bg-zinc-900">
        <header className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-semibold text-pink-500">
            Documentos indexados ({documents.length})
          </h2>
        </header>
        {documents.length === 0 ? (
          <p className="p-4 text-sm text-zinc-400">No hay documentos todavía.</p>
        ) : (
          <ul className="divide-y divide-zinc-800">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-center justify-between gap-4 p-4 text-sm"
              >
                <div>
                  <p className="font-bold text-white">{doc.title}</p>
                  <p className="text-md text-zinc-500">
                    {doc.filename} · {doc.mime_type} ·{' '}
                    {(doc.size_bytes / 1024).toFixed(1)} KB ·{' '}
                    {new Date(doc.created_at).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc.id)}  
                     className="p-2 text-red-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors group"
  title="Eliminar documento">
                  <Trash2 className="size-5" />
  <span className="sr-only">Eliminar</span>
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
