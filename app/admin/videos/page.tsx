'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'
import DeleteButton from '@/presentation/components/admin/DeleteButton'

type Video = Tables<'videos'>

const ITEMS_PER_PAGE = 10

const STATUS_STYLES: Record<string, string> = {
  approved: 'bg-green-900/50 text-green-400',
  pending: 'bg-yellow-900/50 text-yellow-400',
  rejected: 'bg-red-900/50 text-red-400',
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  async function loadVideos() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/videos')
      const data = await res.json()
      if (Array.isArray(data)) {
        setVideos(data)
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVideos()
  }, [])

  useEffect(() => {
    let filtered = videos

    if (statusFilter !== 'all') {
      filtered = filtered.filter(v => v.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(v =>
        v.title.toLowerCase().includes(query) ||
        v.author?.toLowerCase().includes(query) ||
        v.platform.toLowerCase().includes(query) ||
        v.tags?.some(tag => tag.toLowerCase().includes(query))
      )
    }

    setFilteredVideos(filtered)
    setCurrentPage(1)
  }, [searchQuery, statusFilter, videos])

  const totalPages = Math.ceil(filteredVideos.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const currentVideos = filteredVideos.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/videos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) loadVideos()
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-400">Cargando...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Videos</h1>
        <Link href="/admin/videos/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md">
          + Nuevo video
        </Link>
      </div>

      {/* Buscador y filtro de status */}
      <div className="mb-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por título, autor, plataforma o tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
        >
          <option value="all">Todos los estados</option>
          <option value="approved">Aprobados</option>
          <option value="pending">Pendientes</option>
          <option value="rejected">Rechazados</option>
        </select>
      </div>

      <p className="text-xs text-zinc-500 mb-4">
        Mostrando {filteredVideos.length} de {videos.length} videos
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left text-zinc-400 px-4 py-3">Título</th>
              <th className="text-left text-zinc-400 px-4 py-3">Plataforma</th>
              <th className="text-left text-zinc-400 px-4 py-3">Autor</th>
              <th className="text-left text-zinc-400 px-4 py-3">Estado</th>
              <th className="text-left text-zinc-400 px-4 py-3">Tags</th>
              <th className="text-right text-zinc-400 px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentVideos.map(v => (
              <tr key={v.id} className="border-b border-zinc-800 last:border-0">
                <td className="text-white px-4 py-3 max-w-xs">
                  <a href={v.video_url} target="_blank" rel="noopener noreferrer"
                    className="hover:text-indigo-400 line-clamp-1">
                    {v.title}
                  </a>
                </td>
                <td className="text-zinc-400 px-4 py-3 uppercase text-xs">{v.platform}</td>
                <td className="text-zinc-400 px-4 py-3 truncate max-w-[120px]">{v.author || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_STYLES[v.status ?? ''] ?? 'bg-zinc-800 text-zinc-400'}`}>
                    {v.status ?? 'sin estado'}
                  </span>
                </td>
                <td className="text-zinc-400 px-4 py-3">
                  {v.tags && v.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {v.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-block bg-zinc-800 px-2 py-0.5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {v.tags.length > 2 && (
                        <span className="text-xs text-zinc-500">+{v.tags.length - 2}</span>
                      )}
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {v.status !== 'approved' && (
                      <button onClick={() => handleStatusChange(v.id, 'approved')}
                        className="text-green-400 hover:text-green-300 text-xs">
                        Aprobar
                      </button>
                    )}
                    {v.status !== 'rejected' && (
                      <button onClick={() => handleStatusChange(v.id, 'rejected')}
                        className="text-yellow-400 hover:text-yellow-300 text-xs">
                        Rechazar
                      </button>
                    )}
                    <Link href={`/admin/videos/${v.id}/edit`}
                      className="text-indigo-400 hover:text-indigo-300">Editar</Link>
                    <DeleteButton url={`/api/admin/videos/${v.id}`} onSuccess={loadVideos} />
                  </div>
                </td>
              </tr>
            ))}
            {currentVideos.length === 0 && (
              <tr><td colSpan={6} className="text-zinc-500 px-4 py-6 text-center">
                {searchQuery || statusFilter !== 'all' ? 'No se encontraron videos' : 'No hay videos'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-zinc-800 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700">
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-zinc-800 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
