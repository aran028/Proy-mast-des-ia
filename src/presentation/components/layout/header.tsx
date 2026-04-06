'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, LogOut, User as UserIcon, Settings } from 'lucide-react'
import { Input } from '../ui/input'
import { useAuth, useIsAdmin } from '@/presentation/hooks'

interface HeaderProps {
  onSearch?: (query: string) => void
  user?: { email: string } | null
}

export function Header({ onSearch, user }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { signOut } = useAuth()
  const { isAdmin } = useIsAdmin()

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Obtener inicial del email
  const getInitial = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  // Cerrar sesión
  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-10 bg-black/50 backdrop-blur-md border-b border-zinc-800">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              placeholder="Buscar herramientas..."
              className="pl-10 bg-zinc-900 border-zinc-800"
              onChange={(e) => onSearch?.(e.target.value)}
            />
          </div>
        </div>

        {/* User */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative" ref={menuRef}>
              {/* Avatar con inicial */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-9 h-9 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white font-medium transition-colors"
                title={user.email}
              >
                {getInitial(user.email)}
              </button>

              {/* Menú desplegable */}
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
