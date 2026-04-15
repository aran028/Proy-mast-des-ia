'use client'

import { useCallback, useState } from 'react'

export interface GeneratedPrompt {
  prompt: string
  model: string
  toolName: string
  toolWebsite: string | null
}

interface UseGeneratePromptReturn {
  data: GeneratedPrompt | null
  isLoading: boolean
  error: string | null
  generate: (input: { toolId: string; userIntent: string }) => Promise<void>
  reset: () => void
}

export function useGeneratePrompt(): UseGeneratePromptReturn {
  const [data, setData] = useState<GeneratedPrompt | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (input: { toolId: string; userIntent: string }) => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/prompt-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error ?? 'Error al generar el prompt')
        return
      }
      setData(json.data as GeneratedPrompt)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return { data, isLoading, error, generate, reset }
}
