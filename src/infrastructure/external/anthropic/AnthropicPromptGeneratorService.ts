import Anthropic from '@anthropic-ai/sdk'
import type {
  IPromptGeneratorService,
  PromptGenerationInput,
  PromptGenerationResult,
} from '@/application/ports/services'
import { PromptGenerationException } from '@/domain/exceptions'
import { getAnthropicApiKey, getAnthropicModel } from '@/infrastructure/config/env.config'

const MAX_TOKENS = 1024
const REQUEST_TIMEOUT_MS = 30_000

const SYSTEM_INSTRUCTIONS = `Eres un experto en prompt engineering. Tu tarea es generar un prompt optimizado, claro, creativo y bien estructurado para que el usuario lo use directamente en la herramienta de IA indicada.

Reglas estrictas:
- Devuelve SOLO el prompt final. Sin explicaciones, sin encabezados, sin comentarios, sin comillas envolventes.
- El prompt debe estar en el mismo idioma que el objetivo del usuario.
- Usa buenas prácticas: contexto, rol, tarea concreta, formato de salida, restricciones relevantes.
- Adapta el estilo del prompt a la herramienta destino.`

export class AnthropicPromptGeneratorService implements IPromptGeneratorService {
  private readonly client: Anthropic
  private readonly model: string

  constructor(apiKey: string = getAnthropicApiKey(), model: string = getAnthropicModel()) {
    if (!apiKey) {
      throw new PromptGenerationException('ANTHROPIC_API_KEY is not configured')
    }
    this.client = new Anthropic({ apiKey, timeout: REQUEST_TIMEOUT_MS })
    this.model = model
  }

  async generate(input: PromptGenerationInput): Promise<PromptGenerationResult> {
    try {
      const toolContext = input.toolSummary
        ? `Herramienta destino: ${input.toolName} — ${input.toolSummary}.`
        : `Herramienta destino: ${input.toolName}.`

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: MAX_TOKENS,
        system: [
          {
            type: 'text',
            text: `${SYSTEM_INSTRUCTIONS}\n\n${toolContext}`,
            cache_control: { type: 'ephemeral' },
          },
        ],
        messages: [
          {
            role: 'user',
            content: `Objetivo del usuario:\n${input.userIntent}\n\nGenera el prompt optimizado ahora.`,
          },
        ],
      })

      const textBlock = response.content.find((block) => block.type === 'text')
      if (!textBlock || textBlock.type !== 'text' || !textBlock.text.trim()) {
        throw new PromptGenerationException('Empty response from model')
      }

      return {
        prompt: textBlock.text.trim(),
        model: response.model,
      }
    } catch (error) {
      if (error instanceof PromptGenerationException) throw error
      console.error('[AnthropicPromptGenerator] request failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new PromptGenerationException(message)
    }
  }
}
