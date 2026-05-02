'use client'

import { useCallback, useRef, useState } from 'react'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export interface AttachedDocumentInfo {
  name: string
  content: string
  truncated: boolean
  originalLength: number
}

interface UseChatReturn {
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  attachedDocument: AttachedDocumentInfo | null
  isAttaching: boolean
  sendMessage: (content: string) => Promise<void>
  attachDocument: (file: File) => Promise<void>
  detachDocument: () => void
  reset: () => void
}

function newId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachedDocument, setAttachedDocument] =
    useState<AttachedDocumentInfo | null>(null)
  const [isAttaching, setIsAttaching] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const attachDocument = useCallback(async (file: File) => {
    setIsAttaching(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/chat/parse-document', {
        method: 'POST',
        body: formData,
      })
      const payload = await res.json()
      if (!res.ok || !payload.success) {
        throw new Error(payload.error ?? 'No se pudo procesar el archivo')
      }
      setAttachedDocument({
        name: payload.name,
        content: payload.content,
        truncated: !!payload.truncated,
        originalLength: payload.originalLength ?? payload.content.length,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido'
      setError(message)
    } finally {
      setIsAttaching(false)
    }
  }, [])

  const detachDocument = useCallback(() => {
    setAttachedDocument(null)
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isLoading) return

      setError(null)
      const userMsg: ChatMessage = { id: newId(), role: 'user', content: trimmed }
      const assistantId = newId()
      const history = [...messages, userMsg]
      setMessages([...history, { id: assistantId, role: 'assistant', content: '' }])
      setIsLoading(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: history.map((m) => ({ role: m.role, content: m.content })),
            attachedDocument: attachedDocument
              ? { name: attachedDocument.name, content: attachedDocument.content }
              : null,
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const payload = await res.json().catch(() => ({}))
          throw new Error(payload.error ?? `HTTP ${res.status}`)
        }
        if (!res.body) throw new Error('Empty response body')

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        let assembled = ''

        while (true) {
          const { value, done } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const events = buffer.split('\n\n')
          buffer = events.pop() ?? ''

          for (const evt of events) {
            const line = evt.trim()
            if (!line.startsWith('data:')) continue
            const json = line.slice(5).trim()
            if (!json) continue
            try {
              const parsed = JSON.parse(json) as
                | { type: 'text'; value: string }
                | { type: 'done' }
                | { type: 'error'; message: string }
              if (parsed.type === 'text') {
                assembled += parsed.value
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId ? { ...m, content: assembled } : m,
                  ),
                )
              } else if (parsed.type === 'error') {
                throw new Error(parsed.message)
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue
              throw e
            }
          }
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name === 'AbortError') return
        const message = e instanceof Error ? e.message : 'Error desconocido'
        setError(message)
        setMessages((prev) => prev.filter((m) => m.id !== assistantId))
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [isLoading, messages, attachedDocument],
  )

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setMessages([])
    setError(null)
    setIsLoading(false)
    setAttachedDocument(null)
  }, [])

  return {
    messages,
    isLoading,
    error,
    attachedDocument,
    isAttaching,
    sendMessage,
    attachDocument,
    detachDocument,
    reset,
  }
}
