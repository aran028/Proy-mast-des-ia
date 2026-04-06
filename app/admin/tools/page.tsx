'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'
import DeleteButton from '@/presentation/components/admin/DeleteButton'

type Tool = Tables<'tools'>

const ITEMS_PER_PAGE = 10

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [filteredTools, setFilteredTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTools() {
      try {
        const res = await fetch('/api/tools')
        const data = await res.json()
        if (data.success) {
          setTools(data.data)
          setFilteredTools(data.data)
        }
      } catch (error) {
        console.error('Error loading tools:', error)
      } finally {
        setLoading(false)
      }
    }
    loadTools()
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
        tool.tags?.some(tag => tag.toLowerCase().includes(query))
      )
      setFilteredTools(filtered)
    }
    setCurrentPage(1) // Reset a la primera página al buscar
  }, [searchQuery, tools])

  // Calcular paginación
  const totalPages = Math.ceil(filteredTools.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentTools = filteredTools.slice(startIndex, endIndex)

  const handleRefresh = () => {
    setLoading(true)
    fetch('/api/tools')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTools(data.data)
          setFilteredTools(data.data)
        }
      })
      .finally(() => setLoading(false))
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
        <h1 className="text-xl font-bold text-white">Tools</h1>
        <Link href="/admin/tools/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md">
          + Nueva tool
        </Link>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, resumen o tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 text-white rounded-md text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>
        <p className="text-xs text-zinc-500 mt-2">
          Mostrando {filteredTools.length} de {tools.length} tools
        </p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left text-zinc-400 px-4 py-3">Nombre</th>
              <th className="text-left text-zinc-400 px-4 py-3">Resumen</th>
              <th className="text-left text-zinc-400 px-4 py-3">Tags</th>
              <th className="text-right text-zinc-400 px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentTools.map(t => (
              <tr key={t.id} className="border-b border-zinc-800 last:border-0">
                <td className="text-white px-4 py-3">{t.name}</td>
                <td className="text-zinc-400 px-4 py-3 max-w-md truncate">{t.summary || '—'}</td>
                <td className="text-zinc-400 px-4 py-3">
                  {t.tags && t.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {t.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="inline-block bg-zinc-800 px-2 py-0.5 rounded text-xs">
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
                      className="text-indigo-400 hover:text-indigo-300">Editar</Link>
                    <DeleteButton url={`/api/admin/tools/${t.id}`} onSuccess={handleRefresh} />
                  </div>
                </td>
              </tr>
            ))}
            {currentTools.length === 0 && (
              <tr><td colSpan={4} className="text-zinc-500 px-4 py-6 text-center">
                {searchQuery ? 'No se encontraron tools' : 'No hay tools'}
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
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
