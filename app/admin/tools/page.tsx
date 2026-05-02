'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'
import DeleteButton from '@/presentation/components/admin/DeleteButton'
import { Pencil, Plus } from 'lucide-react';

type Tool = Tables<'tools'>
type Playlist = Tables<'playlists'>

const ITEMS_PER_PAGE = 10

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const getPlaylistName = (playlistId: string | null) =>
    playlists.find((playlist) => playlist.id === playlistId)?.name ?? '—'

  const getPlaylistColor = (playlistId: string | null) =>
    playlists.find((playlist) => playlist.id === playlistId)?.color ?? undefined

  async function loadData() {
    try {
      setLoading(true)

      const [toolsRes, playlistsRes] = await Promise.all([
        fetch('/api/tools'),
        fetch('/api/playlists'),
      ])

      const [toolsData, playlistsData] = await Promise.all([
        toolsRes.json(),
        playlistsRes.json(),
      ])

      if (toolsData.success) {
        setTools(toolsData.data)
        setFilteredTools(toolsData.data)
      }

      if (playlistsData.success) {
        setPlaylists(playlistsData.data)
      }
    } catch (error) {
      console.error('Error loading admin tools data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Filtrar tools cuando cambia el query de búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTools(tools)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = tools.filter(tool => 
        tool.name.toLowerCase().includes(query) ||
        tool.summary?.toLowerCase().includes(query) ||
        tool.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        (playlists.find((playlist) => playlist.id === tool.playlist_id)?.name ?? '—').toLowerCase().includes(query)
      )
      setFilteredTools(filtered)
    }
    setCurrentPage(1) // Reset a la primera página al buscar
  }, [searchQuery, tools, playlists])

  // Calcular paginación
  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTools = filteredTools.slice(startIndex, endIndex)

  const handleRefresh = () => {
    void loadData()
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
        <h1 className="text-xl font-bold text-pink-500">Tools</h1>
        <Link href="/admin/tools/new"
     className="bg-pink-500 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2 transition-colors font-medium shadow-lg shadow-pink-500/20">
     <Plus className="size-4" />          
          Nueva tool      
        </Link>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, playlist, resumen o tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md text-sm focus:outline-none focus:border-pink-500"
          />
        </div>
        <p className="text-xs text-pink-500 mt-2">
          Mostrando {filteredTools.length} de {tools.length} tools
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left text-pink-500 px-4 py-3">TOOL</th>
              <th className="text-left text-pink-500 px-4 py-3">PLAYLIST</th>
              <th className="text-left text-pink-500 px-4 py-3">RESUMEN</th>
              <th className="text-left text-pink-500 px-4 py-3">TAGS</th>
              <th className="text-center text-pink-500 px-4 py-3">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {currentTools.map(t => (
              <tr key={t.id} className="border-b border-zinc-800 last:border-0">
                <td className="text-white px-4 py-3">
                  <div className="flex items-center gap-3">
                    {t.image && URL.canParse(t.image) ? (
                      <Image src={t.image} alt={t.name} width={32} height={32} className="rounded object-cover" />
                    ) : (
                      <span className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded text-sm">🔧</span>
                    )}
                    <span>{t.name}</span>
                  </div>
                </td>
                  <td className="text-white px-4 py-3" style={{ backgroundColor: getPlaylistColor(t.playlist_id) }}>{getPlaylistName(t.playlist_id)}</td>
                <td className="text-white px-4 py-3 max-w-md truncate">{t.summary || '—'}</td>
                <td className="text-zinc-400 px-4 py-3">
                  {t.tags && t.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-block bg-pink-500 text-white px-2 py-0.5 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {t.tags.length > 3 && (
                        <span className="text-xs text-zinc-500">+{t.tags.length - 3}</span>
                      )}
                    </div>
                  ) : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/tools/${t.id}/edit`}
   className="p-2 rounded-md text-zinc-400 hover:text-pink-500 hover:bg-zinc-800 transition-colors"
      title="Editar playlist">
        <Pencil className="size-4" />
      <span className="sr-only">Editar</span> {/* Para accesibilidad (lectores de pantalla) */}
      </Link>
           <DeleteButton url={`/api/admin/tools/${t.id}`} onSuccess={handleRefresh} />
                  </div>
                </td>
              </tr>
            ))}
            {currentTools.length === 0 && (
              <tr><td colSpan={5} className="text-zinc-500 px-4 py-6 text-center">
                {searchQuery ? 'No se encontraron tools' : 'No hay tools'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-pink-500">
            Página {currentPage} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-pink-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700">
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-pink-500 text-white rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700">
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
