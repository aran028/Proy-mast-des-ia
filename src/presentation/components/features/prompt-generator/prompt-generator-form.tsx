'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/presentation/components/ui/button'
import { Card } from '@/presentation/components/ui/card'
import { useGeneratePrompt } from '@/presentation/hooks/useGeneratePrompt'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

interface PromptGeneratorFormProps {
  tool: Tool
}

export function PromptGeneratorForm({ tool }: PromptGeneratorFormProps) {
  const [intent, setIntent] = useState('')
  const [copied, setCopied] = useState(false)
  const { data, isLoading, error, generate } = useGeneratePrompt()

  const canSubmit = intent.trim().length >= 10 && intent.trim().length <= 1000 && !isLoading

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setCopied(false)
    await generate({ toolId: tool.id, userIntent: intent.trim() })
  }

  async function handleCopy() {
    if (!data?.prompt) return
    await navigator.clipboard.writeText(data.prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-pink-500" />
          Prompt Generator
        </h1>
        <p className="text-sm text-zinc-400">
          Escribe qué quieres conseguir con <span className="text-pink-400 font-medium">{tool.name}</span> y
          generaremos un prompt optimizado para ti.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label htmlFor="intent" className="block text-sm font-medium text-zinc-300">
          ¿Para qué quieres el prompt?
        </label>
        <textarea
          id="intent"
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          placeholder="Ej: Un email profesional para reclamar un reembolso incluyendo número de pedido y fecha de compra"
          rows={4}
          maxLength={1000}
          className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 px-3 py-2 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 resize-y"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">{intent.length} / 1000 caracteres (mínimo 10)</span>
          <Button type="submit" disabled={!canSubmit} variant="primary">
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generando…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generar
              </>
            )}
          </Button>
        </div>
      </form>

      {error && (
        <Card className="p-4 border-red-500/40 bg-red-950/30">
          <p className="text-sm text-red-300">{error}</p>
        </Card>
      )}

      {data && (
        <Card className="p-4 space-y-3 border-pink-500/30">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-pink-400">Prompt generado</h2>
            <span className="text-xs text-zinc-500">{data.model}</span>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-zinc-200 bg-zinc-950 border border-zinc-800 rounded-md p-3 font-mono">
            {data.prompt}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
            {data.toolWebsite && (
              <a
                href={data.toolWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center h-8 px-3 text-sm rounded-md bg-pink-500 text-white hover:bg-pink-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Probar en {data.toolName}
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
