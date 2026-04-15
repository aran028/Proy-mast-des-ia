'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Home, Search, Library, Brain, Code, Workflow, Terminal, Palette, BookOpen, GitBranch, Server, Layers, Sparkles } from 'lucide-react'
import type { Tables} from '@/shared/types/database.types'


type Playlist = Tables<'playlists'>
const iconMap: Record<string, React.ReactNode> = {
  brain: <Brain className="size-5" />,
  code: <Code className="size-5" />,
  workflow: <Workflow className="size-5" />,
  terminal: <Terminal className="size-5" />,
  palette: <Palette className="size-5" />,
  notebook: <BookOpen className="size-5" />,
  'git-branch': <GitBranch className="size-5" />,
  server: <Server className="size-5" />,
  layers: <Layers className="size-5" />,
}

const iconColors: Record<string, string> = {
  brain: 'bg-gradient-to-br from-purple-500 to-pink-500',
  code: 'bg-gradient-to-br from-blue-500 to-cyan-500',
  workflow: 'bg-gradient-to-br from-green-500 to-emerald-500',
  terminal: 'bg-gradient-to-br from-gray-600 to-gray-800',
  palette: 'bg-gradient-to-br from-pink-500 to-rose-500',
  notebook: 'bg-gradient-to-br from-orange-500 to-yellow-500',
  'git-branch': 'bg-gradient-to-br from-indigo-500 to-purple-500',
  server: 'bg-gradient-to-br from-red-500 to-pink-500',
  layers: 'bg-gradient-to-br from-teal-500 to-blue-500',
}

interface SidebarProps {
  playlists: Playlist[]
  activePlaylist?: string | null
}

export function Sidebar({ playlists, activePlaylist }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-[72px] flex-col gap-2 p-2 sm:w-[240px] lg:w-[280px] bg-black">
      {/* Top nav */}
      <nav className="rounded-lg bg-zinc-900 p-4">
        <ul className="flex flex-col gap-4">
          <li>
            <Link
              href="/"
              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                pathname === '/' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Home className="size-6 shrink-0" />
              <span className="hidden sm:inline text-sm font-medium">Home</span>
            </Link>
          </li>
          <li>
            <Link
              href="/prompt-generator"
              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                pathname.startsWith('/prompt-generator') ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="size-6 shrink-0 text-pink-500" />
              <span className="hidden sm:inline text-sm font-medium">Prompt Generator</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Library */}
      <nav className="flex flex-1 flex-col overflow-hidden rounded-lg bg-zinc-900">
        <div className="flex items-center justify-between p-4 pb-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
          >
            <Library className="size-8 shrink-0" />
            <span className="hidden sm:inline">Playlists de IA</span>
          </button>
        </div>

        {isExpanded && (
          <div className="flex-1 overflow-y-auto px-1 sm:px-2 pb-2">
            {playlists.map((playlist) => {
              const isActive = activePlaylist === playlist.id
              const bgClass = iconColors[playlist.icon || 'layers'] || 'bg-gradient-to-br from-gray-400 to-gray-600'
              
              return (
                <Link
                  key={playlist.id}
                  href={`/?playlist=${playlist.id}`}
                  className={`group mb-1 flex w-full items-center gap-3 rounded-md p-2 text-left transition-all hover:bg-zinc-800 ${
                    isActive ? 'bg-zinc-800' : ''
                  }`}
                >
                  {/* Icono con gradiente */}
                  <div className={`flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-md sm:rounded-lg text-white transition-transform group-hover:scale-110 ${bgClass}`}>
                    {iconMap[playlist.icon || 'layers'] || <Layers className="size-5" />}
                  </div>
                  
                  {/* Info */}
                  <div className="hidden min-w-0 sm:block">
                    <p className="truncate text-sm font-semibold text-white group-hover:text-pink-500 transition-colors">{playlist.name}</p>                   
                    
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </nav>
    </aside>
  )
}
