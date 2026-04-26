import { ToolCard } from './tool-card'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>
interface ToolGridProps {
  tools: Tool[]
  title?: string
  highlightId?: string | null
}

export function ToolGrid({ tools, title, highlightId }: Readonly<ToolGridProps>) {
  if (tools.length === 0) return null

  return (
    <section>
      {title && <h2 className="text-md font-bold uppercase tracking-widest text-pink-500 mb-4">{title}</h2>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isHighlighted={tool.id === highlightId}
          />
        ))}
      </div>
    </section>
  )
}
