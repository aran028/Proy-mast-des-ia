import { Play} from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import type { Tables} from '@/shared/types/database.types'
import Image from 'next/image'


type Tool = Tables<'tools'>

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  return (
    <Card className="group cursor-pointer hover:bg-zinc-800 hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-pink-500/20 overflow-visible">
      {/* Imagen con aspect ratio fijo */}
      <div className="relative w-full aspect-video overflow-hidden bg-zinc-800 rounded-t-lg">
        {tool.image ? (
          <Image
            src={tool.image} 
            alt={tool.name} 
            className="w-full h-full object-cover"
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
            className="absolute inset-0 flex items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-14 h-14 text-pink-500 fill-pink-500 drop-shadow-lg" />
          </a>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-2.5">
        {/* Título y Descripción con tooltip */}
        <div className="relative group/tooltip space-y-2.5">
          {/* Título */}
          <h3 className="font-semibold text-white group-hover:text-pink-500 text-sm leading-tight truncate transition-colors duration-300">
            {tool.name}
          </h3>
          
          {/* Descripción */}
          <p className="text-xs text-white truncate leading-snug">
            {tool.summary}
          </p>
          
          {/* Tooltip elegante */}
          {tool.summary && tool.summary.length > 80 && (
            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all duration-200 z-10 pointer-events-none">
              <p className="text-xs text-zinc-300 leading-relaxed">
                {tool.summary}
              </p>
              {/* Flecha del tooltip */}
              <div className="absolute left-4 bottom-[-6px] w-3 h-3 bg-zinc-900 border-r border-b border-zinc-700 transform rotate-45"></div>
            </div>
          )}
        </div>
        
        {/* Tags */}
        {tool.tags && tool.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs px-2 py-0.5 bg-zinc-800 text-zinc-300 group-hover:bg-black group-hover:text-white transition-colors duration-300"
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
