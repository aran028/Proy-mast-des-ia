import { FileText, Settings, Link2, BookOpen } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import type { Tables } from '@/shared/types/database.types'

type Practice= Tables<'practices'>
const typeIcons: Record<string, typeof FileText> = {
  rag: FileText,
  automation: Settings,
  extraction: Link2,
  tutorial: BookOpen,
}

const typeLabels: Record<string, string> = {
  rag: 'RAG',
  automation: 'Automatización',
  extraction: 'Extracción',
  tutorial: 'Tutorial',
}

interface PracticeCardProps {
  practice: Practice
}

export function PracticeCard({ practice }: Readonly<PracticeCardProps>) {
  const Icon = practice.type ? typeIcons[practice.type] : FileText
  const label = practice.type ? typeLabels[practice.type] : 'Práctica'

  return (
    <Card className="cursor-pointer hover:bg-zinc-800 transition-colors p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-indigo-400" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-medium text-white">{practice.title}</h3>
          <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{practice.description}</p>
          
          <Badge variant="outline" className="mt-2 text-xs">
            {label}
          </Badge>
        </div>
      </div>
    </Card>
  )
}
