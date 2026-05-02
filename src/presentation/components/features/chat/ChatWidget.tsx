'use client'

import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth, useChat } from '@/presentation/hooks'
import { Button } from '@/presentation/components/ui/button'
import {
  SendHorizontal,
  Loader2,
  MessageCircle,
  Sparkles,
  X,
  RotateCcw,
  Paperclip,
  FileText,
  MessagesSquare,
  Bot,
} from "lucide-react";

const markdownComponents = {
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      {...props}
      target="_blank"
      rel="noopener noreferrer"
      className="text-pink-500 underline underline-offset-2 break-all hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300"
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul {...props} className="list-disc space-y-1 pl-5" />
  ),
  ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
    <ol {...props} className="list-decimal space-y-1 pl-5" />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="[&:not(:last-child)]:mb-2" />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code
      {...props}
      className="rounded bg-neutral-200 px-1 py-0.5 font-mono text-[0.85em] dark:bg-neutral-700"
    />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="font-semibold" />
  ),
}


const STORAGE_KEY = 'chatbot-widget-open'

const STARTER_QUESTIONS = [
  '¿Qué playlists hay en el catálogo?',
  '¿Qué tools corresponden a la playlist Agentes y Automatización? ',
  '¿Qué videos de YouTube hay sobre Cloud y Plataformas?',
]

export function ChatWidget() {
  const { user, loading: authLoading } = useAuth()
  const {
    messages,
    isLoading,
    error,
    attachedDocument,
    isAttaching,
    sendMessage,
    attachDocument,
    detachDocument,
    reset,
  } = useChat()
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem(STORAGE_KEY) === 'true'
  })
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(open))
    }
  }, [open])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages])

  if (authLoading || !user) return null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const value = input.trim()
    if (!value) return
    setInput('')
    await sendMessage(value)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) await attachDocument(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
     {/* EL CHAT (Se muestra solo si open es true) */}
      {open ? (
        <div className="flex h-[32rem] w-[22rem] flex-col rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
   <header className="relative flex items-center justify-between border-b border-white/10 p-4 bg-pink-600 dark:bg-pink-900/80 backdrop-blur-md rounded-t-lg">
  {/* Decoración sutil de fondo para resaltar que es IA */}
  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent pointer-events-none" />

  <div className="flex items-center gap-3 relative">
    {/* Avatar o Icono de la IA */}
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 shadow-inner">
      <Sparkles className="h-5 w-5 text-white" />
    </div>
    
    <div>
      <h3 className="text-md font-bold tracking-tight text-white">
        Asistente del catálogo
      </h3>
      <p className="text-[13px] leading-tight text-pink-100/80 font-medium">
        Playlists, tools, videos y documentos
      </p>
    </div>
  </div>

  <div className="flex gap-1 relative">
    <Button
      variant="ghost"
      size="icon"
      onClick={reset}
      className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
      title="Reiniciar"
    >
      <RotateCcw className="h-4 w-4" />
    </Button>
    
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(false)}
      className="h-8 w-8 text-white hover:bg-white/20 hover:text-white"
    >
      <X className="h-5 w-5" />
    </Button>
  </div>
</header>

          <div
  ref={scrollRef}
  className="flex-1 space-y-4 overflow-y-auto p-4 text-sm scroll-smooth"
>
  {messages.length === 0 && (
    <div className="flex h-full flex-col justify-center space-y-4 px-1">
      <div className="flex flex-col items-center space-y-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950/40">
          <Bot className="h-6 w-6 text-pink-600 dark:text-pink-400" />
        </div>
        <h4 className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          Hola ¿En qué puedo ayudarte?
        </h4>
      </div>

      <div className="space-y-2 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
        <p>
          Te respondo sobre las{' '}
          <span className="font-semibold text-pink-600 dark:text-pink-400">tools</span>,{' '}
          <span className="font-semibold text-pink-600 dark:text-pink-400">playlists</span> y{' '}
          <span className="font-semibold text-pink-600 dark:text-pink-400">videos</span> del catálogo.
        </p>
        <p className="flex items-start gap-1.5">
          <Paperclip className="mt-0.5 h-3 w-3 shrink-0 text-pink-600" />
          <span>
            Pulsa el clip para adjuntar un PDF, MD o TXT y preguntar sobre él en
            esta conversación.
          </span>
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-500">
          Prueba con
        </p>
        {STARTER_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => sendMessage(q)}
            disabled={isLoading}
            className="block w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-left text-xs text-neutral-700 transition-colors hover:border-pink-500 hover:bg-pink-50 disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-pink-700 dark:hover:bg-pink-950/20"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )}

  {messages.map((m) => (
    <div
      key={m.id}
      className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={
          m.role === 'user'
            ? 'max-w-[85%] rounded-2xl rounded-tr-none bg-pink-600 px-4 py-2 text-white shadow-sm'
            : 'max-w-[85%] rounded-2xl rounded-tl-none bg-neutral-100 px-4 py-2 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100 shadow-sm'
        }
      >
        {m.role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {m.content}
          </ReactMarkdown>
        ) : (
          m.content
        )}
      </div>
    </div>
  ))}

  {isLoading && messages[messages.length - 1]?.role === 'user' && (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-tl-none bg-neutral-100 px-4 py-2 dark:bg-neutral-800">
        <span className="flex gap-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.3s]"></span>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400 [animation-delay:-0.15s]"></span>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-400"></span>
        </span>
      </div>
    </div>
  )}
</div>
<form
  onSubmit={handleSubmit}
  className="relative border-t border-neutral-200 p-4 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm"
>
  <input
    ref={fileInputRef}
    type="file"
    accept=".pdf,.md,.markdown,.txt,application/pdf,text/markdown,text/plain"
    onChange={handleFileChange}
    className="hidden"
  />

  {error && (
    <p className="mb-2 rounded-md bg-red-50 px-3 py-1.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-200">
      {error}
    </p>
  )}

  {attachedDocument && (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-pink-50 px-3 py-2 text-xs dark:bg-pink-950/40">
      <div className="flex min-w-0 items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-pink-600 dark:text-pink-400" />
        <div className="min-w-0">
          <p className="truncate font-medium text-pink-700 dark:text-pink-200">
            {attachedDocument.name}
          </p>
          {attachedDocument.truncated && (
            <p className="text-[11px] text-pink-600/80 dark:text-pink-300/80">
              Truncado a 50k caracteres (de {attachedDocument.originalLength.toLocaleString()})
            </p>
          )}
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={detachDocument}
        className="h-6 w-6 shrink-0 text-pink-700 hover:bg-pink-100 dark:text-pink-300 dark:hover:bg-pink-900/40"
        title="Quitar documento"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )}

  <div className="relative flex items-center">
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => fileInputRef.current?.click()}
      disabled={isLoading || isAttaching}
      title="Adjuntar documento (PDF, MD, TXT)"
      className="absolute left-1.5 h-8 w-8 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-pink-600 dark:hover:bg-neutral-800"
    >
      {isAttaching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Paperclip className="h-4 w-4" />
      )}
    </Button>
    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder={attachedDocument ? `Pregunta sobre ${attachedDocument.name}...` : 'Escribe tu pregunta...'}
      disabled={isLoading}
      className="w-full rounded-xl border border-neutral-300 bg-white py-3 pl-12 pr-12 text-sm transition-all focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20 outline-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800"
    />
    <Button
      type="submit"
      size="sm"
      disabled={isLoading || !input.trim()}
      className="absolute right-1.5 h-8 w-8 rounded-lg bg-pink-600 hover:bg-pink-700 transition-colors"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <SendHorizontal className="h-4 w-4 text-white" />
      )}
    </Button>
  </div>
</form>
</div>
      ) : (
        <Button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Pulsa en el widget para abrir el chat"
         className="h-14 w-14 rounded-full bg-linear-to-br from-pink-500 to-pink-700 shadow-xl hover:scale-110 transition-transform duration-200"
        >
            <MessagesSquare className="h-6 w-6 text-white" />
        </Button>
      )}
    </div>
  )
}
  