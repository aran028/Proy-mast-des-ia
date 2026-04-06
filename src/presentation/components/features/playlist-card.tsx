import Link from 'next/link'
import { Brain, Code, Workflow, Terminal, Palette, BookOpen, GitBranch, Server, Layers } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>
const iconMap: Record<string, React.ReactElement> = {
  brain: <Brain className="size-10" />,
  code: <Code className="size-10" />,
  workflow: <Workflow className="size-10" />,
  terminal: <Terminal className="size-10" />,
  palette: <Palette className="size-10" />,
  notebook: <BookOpen className="size-10" />,
  'git-branch': <GitBranch className="size-10" />,
  server: <Server className="size-10" />,
  layers: <Layers className="size-10" />,
}


const iconColors: Record<string, string> = {
  brain: 'from-purple-600 to-pink-600',
  code: 'from-blue-600 to-cyan-600',
  workflow: 'from-green-600 to-emerald-600',
  terminal: 'from-gray-600 to-gray-800',
  palette: 'from-pink-600 to-rose-600',
  notebook: 'from-orange-600 to-yellow-600',
  'git-branch': 'from-indigo-600 to-purple-600',
  server: 'from-red-600 to-pink-600',
  layers: 'from-teal-600 to-blue-600',
}

interface PlaylistCardsProps {
  playlists: Playlist[]
}

export function PlaylistCards({ playlists }: PlaylistCardsProps) {
  if (!playlists.length) return null

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Categorías</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {playlists.map((playlist) => {
          const bgGradient = iconColors[playlist.icon || 'layers'] || 'from-gray-600 to-gray-800'
          const Icon = iconMap[playlist.icon || 'layers'] || <Layers className="size-10" />
          
          return (
            <Link
              key={playlist.id}
              href={`/?playlist=${playlist.id}`}
              className="group relative rounded-lg overflow-hidden bg-zinc-900 hover:bg-zinc-800 transition-all"
            >
              {/* Imagen/Icono grande */}
              <div className={`aspect-square bg-gradient-to-br ${bgGradient} flex items-center justify-center text-white`}>
                {Icon}
              </div>
              
              {/* Info */}
              <div className="p-3">
                <h3 className="font-semibold text-white truncate text-sm">{playlist.name}</h3>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
