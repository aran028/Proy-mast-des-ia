'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Input } from '../ui/input'
import { useAuth, useIsAdmin, useTools } from '@/presentation/hooks'
import Image from 'next/image'

interface HeaderProps {
  onSearch?: (query: string) => void
  user?: { email: string } | null
}

export function Header({ onSearch, user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { signOut } = useAuth()
  const { isAdmin } = useIsAdmin()

  // Cargar todas las tools para búsqueda
  const { tools } = useTools()

  // Filtrar tools por nombre según lo que escribe el usuario
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.summary?.toLowerCase().includes(query)
    ).slice(0, 6)
  }, [searchQuery, tools])

  const showDropdown = searchFocused && searchQuery.trim().length > 0

  // Cerrar menú y dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Cerrar dropdown con Escape
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setSearchFocused(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const getInitial = (email: string) => email.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  return (
    <header className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-zinc-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md" ref={searchRef}>
          <div className="relative">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-all duration-300 ${
                searchFocused ? 'w-5 h-5 text-pink-500' : 'w-4 h-4'
              }`}
            />
            <Input
              placeholder="Buscar herramientas..."
              value={searchQuery}
              className={`pl-10 bg-zinc-900 transition-all duration-300 ${
                searchFocused
                  ? 'border-pink-500 shadow-sm shadow-pink-500/20'
                  : 'border-zinc-800'
              }`}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
            />

            {/* Dropdown de resultados */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-pink-500/5 overflow-hidden z-30">
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map((tool) => (
                      <li key={tool.id}>
                        <a
                          href={tool.website ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800 transition-colors"
                          onClick={() => {
                            setSearchFocused(false)
                            setSearchQuery('')
                          }}
                        >
                          {/* Miniatura circular */}
                          <div className="relative w-9 h-9 rounded-full overflow-hidden bg-zinc-800 shrink-0">
                            {tool.image && URL.canParse(tool.image) ? (
                              <Image
                                src={tool.image}
                                alt={tool.name}
                                fill
                                sizes="36px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-sm">
                                🔧
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {tool.name}
                            </p>
                            <p className="text-xs text-zinc-500 truncate">
                              {tool.summary}
                            </p>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-zinc-500">
                    No se encontraron herramientas
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white font-medium transition-colors"
                title={user.email}
              >
                {getInitial(user.email)}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-zinc-800">
                    <p className="text-sm text-white truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    Mi perfil
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
