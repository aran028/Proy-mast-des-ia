import { Play, Sparkles } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import type { Tables } from '@/shared/types/database.types'
import Image from 'next/image'

type Tool = Tables<'tools'>

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="group cursor-pointer hover:bg-zinc-800 transition-all duration-300 shadow-lg hover:shadow-pink-500/20 overflow-visible">
      {/* Imagen cuadrada */}
      <div className="relative w-full aspect-square overflow-hidden bg-zinc-800">
        {tool.image && URL.canParse(tool.image) ? (
          <Image
            src={tool.image}
            alt={tool.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">🔧</span>
          </div>
        )}

        {/* Overlay con icono al hover */}
        {tool.website && (
          <a
            href={tool.website}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-10 h-10 text-pink-500 fill-pink-500 drop-shadow-lg" />
          </a>
        )}
      </div>

      {/* Contenido */}
      <div className="p-3 space-y-1.5">
        {/* Nombre y descripción con tooltip */}
        <div className="relative group/info">
          <h3 className="font-semibold text-white group-hover:text-pink-500 text-sm leading-tight truncate transition-colors duration-300">
            {tool.name}
          </h3>

          <p className="text-xs text-zinc-400 truncate leading-relaxed mt-1">
            {tool.summary}
          </p>

          {/* Popup con borde rosa */}
          {tool.summary && (
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-3 w-64 p-4 bg-zinc-950 border border-pink-500/60 rounded-xl shadow-xl shadow-pink-500/10 opacity-0 invisible group-hover/info:opacity-100 group-hover/info:visible transition-all duration-300 z-20 pointer-events-none">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-pink-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-pink-400 mb-1">{tool.name}</p>
                  <p className="text-xs text-zinc-300 leading-relaxed">{tool.summary}</p>
                </div>
              </div>
              {/* Flecha */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-6px] w-3 h-3 bg-zinc-950 border-r border-b border-pink-500/60 rotate-45" />
            </div>
          )}
        </div>

        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tool.tags.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] px-1.5 py-0 bg-[#0a0a0a] text-zinc-400 group-hover:text-pink-400 transition-colors duration-300"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
