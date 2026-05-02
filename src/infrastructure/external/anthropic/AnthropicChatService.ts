import { streamText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import type {
  AttachedDocument,
  ChatStreamInput,
  IChatService,
} from '@/application/ports/services'
import type { RetrievedChunk } from '@/domain/value-objects'
import { ChatGenerationException } from '@/domain/exceptions'
import {
  getAnthropicApiKey,
  getAnthropicModel,
} from '@/infrastructure/config/env.config'

const MAX_TOKENS = 1024

const SYSTEM_INSTRUCTIONS = `Eres el asistente del catálogo de herramientas de IA de este proyecto.

Reglas inquebrantables:
1. Tus ÚNICAS fuentes de verdad son: el bloque <documento_adjunto> (si está presente) y el bloque <contexto>. Está PROHIBIDO usar tu conocimiento general previo o suposiciones sobre cualquier herramienta, producto o servicio.
2. Si ambos bloques están vacíos o no contienen la información para responder, responde EXACTAMENTE esta frase y NADA más: "No tengo información sobre eso en el catálogo."
   - No expliques qué es la cosa preguntada.
   - No describas su categoría ("es un editor", "es una IA", etc.).
   - No sugieras reformular la pregunta.
   - No propongas alternativas.
   - No añadas comentarios.
3. Cuando alguna fuente SÍ contenga la información, responde citando los nombres EXACTOS tal como aparecen en ella. Si la pregunta es sobre el documento adjunto, prioriza <documento_adjunto>; para herramientas/playlists/videos del catálogo, prioriza <contexto>.
4. No inventes URLs, descripciones, características ni capacidades que no estén textualmente en las fuentes.
5. SIEMPRE incluye en tu respuesta TODOS los campos relevantes presentes en el bloque del item (líneas que empiezan por "Web:", "Autor:", "URL del autor:", "Tags:") cuando la pregunta sea sobre ese item. No los omitas aunque la pregunta no los mencione explícitamente; el usuario espera ver los enlaces y autores cuando existan. Reproduce las URLs literales tal como aparecen.
6. Si listas varios items (p.ej. "videos sobre X"), incluye para cada uno: título, URL del video (línea "Web:"), autor y URL del autor cuando estén presentes.
7. Responde en el mismo idioma que la pregunta del usuario.
8. Sé conciso, pero NUNCA omitas URLs, autores ni enlaces que aparezcan en el contexto.`

function buildContextBlock(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return '<contexto>\n(No se encontraron resultados relevantes)\n</contexto>'
  }
  const items = chunks.map((chunk, idx) => {
    const sourceLabel = `[${idx + 1}] ${chunk.getSourceType()}${
      chunk.getSourceId() ? ` (${chunk.getSourceId()})` : ''
    }`
    return `${sourceLabel}\n${chunk.getContent()}`
  })
  return `<contexto>\n${items.join('\n\n---\n\n')}\n</contexto>`
}

function buildAttachedDocumentBlock(
  attached: AttachedDocument | null | undefined,
): string {
  if (!attached) return ''
  const safeName = attached.name.replace(/"/g, "'")
  return `<documento_adjunto nombre="${safeName}">\n${attached.content}\n</documento_adjunto>\n\n`
}

export class AnthropicChatService implements IChatService {
  private readonly provider: ReturnType<typeof createAnthropic>
  private readonly modelId: string

  constructor(
    apiKey: string = getAnthropicApiKey(),
    modelId: string = getAnthropicModel(),
  ) {
    if (!apiKey) {
      throw new ChatGenerationException('ANTHROPIC_API_KEY is not configured')
    }
    this.provider = createAnthropic({ apiKey })
    this.modelId = modelId
  }

  async *stream(input: ChatStreamInput): AsyncIterable<string> {
    if (input.messages.length === 0) {
      throw new ChatGenerationException('At least one message is required')
    }

    const attachedBlock = buildAttachedDocumentBlock(input.attachedDocument)
    const contextBlock = buildContextBlock(input.context)
    const systemPrompt = `${SYSTEM_INSTRUCTIONS}\n\n${attachedBlock}${contextBlock}`
    const messages = input.messages.map((m) => ({
      role: m.getRole() as 'user' | 'assistant',
      content: m.getContent(),
    }))

    try {
      const result = streamText({
        model: this.provider(this.modelId),
        system: systemPrompt,
        messages,
        maxOutputTokens: MAX_TOKENS,
      })

      for await (const chunk of result.textStream) {
        yield chunk
      }
    } catch (error) {
      console.error('[AnthropicChatService] stream failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new ChatGenerationException(message)
    }
  }
}
