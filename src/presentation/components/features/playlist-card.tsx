import Link from 'next/link'
import { Brain, Code, Workflow, Terminal, Palette, BookOpen, GitBranch, Server, Layers, Bot, Sparkles, Cpu, Shield, Dna, Cloud, FlaskConical, Wrench } from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'
import { getPlaylistHexColor, normalizePlaylistIconKey } from '@/shared/constants/playlist-icons'

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
  bot: <Bot className="size-10" />,
  sparkles: <Sparkles className="size-10" />,
  cpu: <Cpu className="size-10" />,
  shield: <Shield className="size-10" />,
  'ai-frameworks': <Dna className="size-10" />,
  cloud: <Cloud className="size-10" />,
  devops: <Wrench className="size-10" />,
  test: <FlaskConical className="size-10" />,
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
  bot: 'from-fuchsia-600 to-violet-700',
  sparkles: 'from-amber-500 to-orange-600',
  cpu: 'from-slate-600 to-gray-800',
  shield: 'from-cyan-600 to-blue-700',
  'ai-frameworks': 'from-violet-600 to-fuchsia-700',
  cloud: 'from-sky-500 to-cyan-600',
  devops: 'from-amber-600 to-orange-700',
  test: 'from-lime-500 to-emerald-600',
  layers: 'from-teal-600 to-blue-600',
}

interface PlaylistCardsProps {
  playlists: Playlist[]
}

export function PlaylistCards({ playlists }: Readonly<PlaylistCardsProps>) {
  if (!playlists.length) return null

  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4">Playlists</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {playlists.map((playlist) => {
          const iconKey = normalizePlaylistIconKey(playlist.icon)
          const bgGradient = iconColors[iconKey] || 'from-gray-600 to-gray-800'
          const Icon = iconMap[iconKey] || <Layers className="size-10" />
          const customColor = getPlaylistHexColor(playlist.color)
          const iconBackgroundClass = customColor ? '' : `bg-linear-to-br ${bgGradient}`
          
          return (
            <Link
              key={playlist.id}
              href={`/?playlist=${playlist.id}`}
              className="group relative rounded-lg overflow-hidden bg-zinc-900 hover:bg-zinc-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50"
            >
              {/* Imagen/Icono grande */}
              <div
                className={`aspect-square flex items-center justify-center text-white transition-transform duration-500 group-hover:scale-105 ${iconBackgroundClass}`}
                style={customColor ? { backgroundColor: customColor } : undefined}
              >
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
