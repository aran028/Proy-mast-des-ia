'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, LogOut, User as UserIcon, Settings, Home, X } from 'lucide-react'
import { Input } from '../ui/input'
import { useAuth, useIsAdmin, useTools, usePlaylists } from '@/presentation/hooks'
import Image from 'next/image'

interface HeaderProps {
  onSearch?: (query: string) => void
  user?: { email: string } | null
}

export function Header({ onSearch, user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [isMac, setIsMac] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { signOut } = useAuth()
  const { isAdmin } = useIsAdmin()

  // Cargar todas las tools y playlists para búsqueda
  const { tools } = useTools()
  const { playlists } = usePlaylists()

  // Mapa de playlist_id → nombre
  const playlistMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of playlists) {
      map.set(p.id, p.name)
    }
    return map
  }, [playlists])

  // Filtrar tools por nombre según lo que escribe el usuario
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return tools.filter(tool =>
      tool.name.toLowerCase().includes(query) ||
      tool.summary?.toLowerCase().includes(query)
    )
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
        setMobileSearchOpen(false)
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
        setMobileSearchOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Auto-focus al abrir el search en móvil
  useEffect(() => {
    if (mobileSearchOpen) inputRef.current?.focus()
  }, [mobileSearchOpen])

  // Detectar plataforma para el hint visual del atajo
  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  // Atajo ⌘K / Ctrl+K para enfocar el search
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        if (globalThis.matchMedia('(min-width: 768px)').matches) {
          inputRef.current?.focus()
        } else {
          setMobileSearchOpen(true)
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Resetear índice activo cuando cambian los resultados
  useEffect(() => {
    setActiveIndex(searchResults.length > 0 ? 0 : -1)
  }, [searchResults])

  // Hacer scroll a la opción activa
  useEffect(() => {
    if (activeIndex < 0) return
    document.getElementById(`search-option-${activeIndex}`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const getInitial = (email: string) => email.charAt(0).toUpperCase()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    onSearch?.(value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || searchResults.length === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % searchResults.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? searchResults.length - 1 : i - 1))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(searchResults.length - 1)
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      const anchor = document
        .getElementById(`search-option-${activeIndex}`)
        ?.querySelector('a')
      anchor?.click()
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-zinc-800">
      <div className="relative flex items-center justify-between px-4 md:px-6 py-3 md:py-4 gap-3">
        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
          {/* Home */}
          <Link href="/" className="shrink-0 text-zinc-400 hover:text-pink-400 transition-colors">
            <Home className="size-6" />
          </Link>

          {/* Search */}
          <div
            ref={searchRef}
            className={
              mobileSearchOpen
                ? 'absolute inset-x-0 top-0 bottom-0 flex items-center gap-2 px-4 bg-black z-50'
                : 'hidden md:block w-full max-w-125'
            }
          >
            {mobileSearchOpen && (
              <button
                type="button"
                onClick={() => {
                  setMobileSearchOpen(false)
                  setSearchFocused(false)
                }}
                className="shrink-0 text-zinc-400 hover:text-pink-400 transition-colors"
                aria-label="Cerrar búsqueda"
              >
                <X className="size-6" />
              </button>
            )}
          <div className="group relative flex-1">
            <Search
              className={`absolute left-3 top-1/2 -translate-y-1/2 text-white transition-all duration-300 ${
                searchFocused ? 'w-5 h-5 text-pink-500' : 'w-4 h-4'
              }`}
            />
            <Input
              ref={inputRef}
              placeholder="Buscar tools..."
              value={searchQuery}
              role="combobox"
              aria-expanded={showDropdown}
              aria-controls="search-results-listbox"
              aria-autocomplete="list"
              aria-activedescendant={
                showDropdown && activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
              }
              className={`pl-10 pr-16 bg-zinc-900 placeholder:text-white placeholder:font-bold placeholder:text-lg focus:text-pink-400 transition-all duration-300 ${
                searchFocused
                  ? 'border-pink-500 shadow-sm shadow-pink-500/20'
                  : 'border-zinc-800'
              }`}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={handleSearchKeyDown}
            />

            {/* Hint atajo de teclado: solo en hover sobre el buscador (md+) */}
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-400 pointer-events-none select-none md:group-hover:flex">
              {isMac ? '⌘' : 'Ctrl'} K
            </kbd>

            {/* Dropdown de resultados */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl shadow-pink-500/5 overflow-y-auto max-h-[70vh] z-30">
                {searchResults.length > 0 ? (
                  <div id="search-results-listbox" role="listbox">
                    {searchResults.map((tool, index) => (
                      <div
                        key={tool.id}
                        id={`search-option-${index}`}
                        role="option"
                        aria-selected={index === activeIndex}
                      >
                        <a
                          href={tool.website ?? '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                            index === activeIndex ? 'bg-zinc-800' : 'hover:bg-zinc-800'
                          }`}
                          onMouseEnter={() => setActiveIndex(index)}
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
                            <p className="text-lg font-bold text-white truncate">
                              {tool.name}
                            </p>
                            {tool.playlist_id && playlistMap.get(tool.playlist_id) && (
                              <p className="text-md text-pink-400 truncate">
                                {playlistMap.get(tool.playlist_id)}
                              </p>
                            )}
                            <p className="text-xs text-white/50 truncate">
                              {tool.summary}
                            </p>
                          </div>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-zinc-500">
                    No se encontraron herramientas
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Trigger búsqueda móvil */}
          <button
            type="button"
            onClick={() => setMobileSearchOpen(true)}
            className="md:hidden shrink-0 text-zinc-400 hover:text-pink-400 transition-colors"
            aria-label="Buscar"
          >
            <Search className="size-6" />
          </button>

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white font-medium transition-colors"
                title={user.email}
                aria-label={`Menú de usuario (${user.email})`}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                aria-controls="user-menu"
              >
                {getInitial(user.email)}
              </button>

              {menuOpen && (
                <div
                  id="user-menu"
                  role="menu"
                  className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                    <UserIcon className="w-4 h-4 text-zinc-400 shrink-0" />
                    <p className="text-sm text-white truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      role="menuitem"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Panel Admin
                    </Link>
                  )}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-400 hover:text-pink-400 hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex flex-col items-center gap-1 text-sm text-zinc-400 hover:text-white"
            >
              <Image
                src="/assets/Logo.png"
                alt="Logo"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span>Iniciar sesión</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
