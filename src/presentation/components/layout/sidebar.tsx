'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Library, Brain, Code, Workflow, Terminal, Palette, BookOpen, GitBranch, Server, Layers, Sparkles, Bot, Cpu, Shield, Dna, Cloud, FlaskConical, Wrench, PlayCircle, ToolboxIcon, Search } from 'lucide-react'
import Image from 'next/image'
import type { Tables } from '@/shared/types/database.types'
import { getPlaylistHexColor, normalizePlaylistIconKey } from '@/shared/constants/playlist-icons'
import { useTools } from '@/presentation/hooks'


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
  bot: <Bot className="size-5" />,
  sparkles: <Sparkles className="size-5" />,
  cpu: <Cpu className="size-5" />,
  shield: <Shield className="size-5" />,
  'ai-frameworks': <Dna className="size-5" />,
  cloud: <Cloud className="size-5" />,
  devops: <Wrench className="size-5" />,
  test: <FlaskConical className="size-5" />,
  layers: <Layers className="size-5" />,
}

interface SidebarProps {
  playlists: Playlist[]
  activePlaylist?: string | null
}

export function Sidebar({ playlists, activePlaylist }: Readonly<SidebarProps>) {
  const [view, setView] = useState<'playlists' | 'tools'>('playlists')
  const [filterQuery, setFilterQuery] = useState('')

  const switchView = (next: 'playlists' | 'tools') => {
    setView(next)
    setFilterQuery('')
  }
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const section = searchParams.get('section')
  const isHomeActive = pathname === '/' && !section
  const isYoutubeSectionActive = pathname === '/' && section === 'latest-youtube-videos'

  const { tools, loading: loadingTools } = useTools()

  const playlistMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const p of playlists) map.set(p.id, p.name)
    return map
  }, [playlists])

  const sortedTools = useMemo(
    () => [...tools].sort((a, b) => a.name.localeCompare(b.name)),
    [tools]
  )

  const normalizedQuery = filterQuery.trim().toLowerCase()

  const filteredPlaylists = useMemo(
    () => normalizedQuery
      ? playlists.filter(p => p.name.toLowerCase().includes(normalizedQuery))
      : playlists,
    [playlists, normalizedQuery]
  )

  const filteredTools = useMemo(
    () => normalizedQuery
      ? sortedTools.filter(t => t.name.toLowerCase().includes(normalizedQuery))
      : sortedTools,
    [sortedTools, normalizedQuery]
  )

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-18 flex-col gap-2 bg-black p-2 sm:w-60 lg:w-70">
      {/* Top nav */}
      <nav className="rounded-lg bg-zinc-900 p-4">
        <ul className="flex flex-col gap-4">
          <li>
            <Link
              href="/"
              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                isHomeActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >  
          <Image
            src="/assets/Logo.png"
            alt="Home"
            width={50}
            height={50}
            className="rounded-lg hover:opacity-80 transition-opacity"
          />   
            </Link>
          </li>
          <li>
            <Link
              href="/prompt-generator"
              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                pathname.startsWith('/prompt-generator') ? 'bg-zinc-800 text-white' : 'text-white hover:text-pink-500 hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="size-6 shrink-0 text-white hover:text-pink-500" />
              <span className="hidden sm:inline text-sm font-semibold">Prompt Generator</span>      
            </Link>
          </li>
           <li>
            <Link
              href="/?section=latest-youtube-videos#latest-youtube-videos"
              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                isYoutubeSectionActive ? 'bg-zinc-800 text-white' : 'text-white hover:text-pink-500 hover:bg-zinc-800'
              }`}
            >
              <PlayCircle className="size-6 shrink-0 text-red-500 hover:text-pink-500" />
              <span className="hidden sm:inline text-sm font-semibold">Vídeos de Youtube</span>
            </Link>
          </li>
        </ul>
      </nav>

      {/* Library / Tools */}
      <nav className="flex flex-1 flex-col overflow-hidden rounded-lg bg-zinc-900">
        <div role="tablist" className="flex items-center gap-1 border-b border-zinc-800 p-2">
          <button
            type="button"
            role="tab"
            aria-selected={view === 'playlists'}
            onClick={() => switchView('playlists')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:justify-start ${
              view === 'playlists'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-pink-500'
            }`}
          >
            <Library className="size-5 shrink-0" />
            <span className="hidden sm:inline font-semibold">Playlists</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={view === 'tools'}
            onClick={() => switchView('tools')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors sm:justify-start ${
              view === 'tools'
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-pink-500'
            }`}
          >
            <ToolboxIcon className="size-5 shrink-0" />
            <span className="hidden sm:inline font-semibold">Tools</span>
          </button>
        </div>

        {/* Buscador del tab activo */}
        <div className="hidden sm:block px-2 pt-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder={view === 'playlists' ? 'Buscar en playlists' : 'Buscar en tools'}
              aria-label={view === 'playlists' ? 'Buscar en playlists' : 'Buscar en tools'}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 py-1.5 pl-8 pr-2 text-sm text-white placeholder:text-zinc-500 focus:border-pink-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-1 py-2 sm:px-2">
          {view === 'playlists' && filteredPlaylists.length === 0 && (
            <p className="hidden sm:block px-2 py-3 text-xs text-zinc-500">Sin resultados</p>
          )}
          {view === 'playlists' && filteredPlaylists.map((playlist) => {
            const isActive = activePlaylist === playlist.id
            const iconKey = normalizePlaylistIconKey(playlist.icon)
            const customColor = getPlaylistHexColor(playlist.color)

            return (
              <Link
                key={playlist.id}
                href={`/?playlist=${playlist.id}`}
                aria-label={playlist.name}
                className={`group relative mb-1 flex w-full items-center gap-3 rounded-md p-2 text-left transition-all hover:bg-zinc-800 ${
                  isActive ? 'bg-zinc-800' : ''
                }`}
              >
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-md text-white transition-transform group-hover:scale-110 sm:size-10 sm:rounded-lg"
                  style={customColor ? { backgroundColor: customColor } : undefined}
                >
                  {iconMap[iconKey] || <Layers className="size-5" />}
                </div>

                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-pink-500">{playlist.name}</p>
                </div>

                <span className="pointer-events-none absolute left-12 right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-md border border-zinc-600/60 bg-zinc-900/95 px-2 py-1 text-xs font-medium text-pink-400 shadow-lg backdrop-blur-sm group-hover:sm:block">
                  {playlist.name}
                </span>
              </Link>
            )
          })}

          {view === 'tools' && (
            <>
              {loadingTools && (
                <p className="px-2 py-3 text-xs text-zinc-500">Cargando…</p>
              )}
              {!loadingTools && sortedTools.length === 0 && (
                <p className="px-2 py-3 text-xs text-zinc-500">Sin tools</p>
              )}
              {!loadingTools && sortedTools.length > 0 && filteredTools.length === 0 && (
                <p className="hidden sm:block px-2 py-3 text-xs text-zinc-500">Sin resultados</p>
              )}
              {!loadingTools && filteredTools.map((tool) => {
                const playlistName = tool.playlist_id ? playlistMap.get(tool.playlist_id) : undefined
                const href = tool.playlist_id
                  ? `/?playlist=${tool.playlist_id}&highlight=${tool.id}`
                  : '/'
                return (
                  <Link
                    key={tool.id}
                    href={href}
                    aria-label={tool.name}
                    className="group relative mb-1 flex w-full items-center gap-3 rounded-md p-2 text-left transition-all hover:bg-zinc-800"
                  >
                    <div className="relative size-8 shrink-0 overflow-hidden rounded-md bg-zinc-800 sm:size-10 sm:rounded-lg">
                      {tool.image && URL.canParse(tool.image) ? (
                        <Image
                          src={tool.image}
                          alt={tool.name}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm">🔧</div>
                      )}
                    </div>

                    <div className="hidden min-w-0 sm:block">
                      <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-pink-500">{tool.name}</p>
                      {playlistName && (
                        <p className="truncate text-xs text-zinc-400  group-hover:text-pink-500">{playlistName}</p>
                      )}
                    </div>

                    <span className="pointer-events-none absolute left-12 right-2 top-1/2 z-20 hidden -translate-y-1/2 rounded-md border border-zinc-600/60 bg-zinc-900/95 px-2 py-1 text-xs font-medium text-pink-500 shadow-lg backdrop-blur-sm group-hover:sm:hidden">
                      {tool.name}
                    </span>
                  </Link>
                )
              })}
            </>
          )}
        </div>
      </nav>
     
    </aside>
  )
}
