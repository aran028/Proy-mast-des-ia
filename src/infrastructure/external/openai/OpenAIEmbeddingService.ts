import OpenAI from 'openai'
import type { IEmbeddingService } from '@/application/ports/services'
import { EmbeddingFailedException } from '@/domain/exceptions'
import {
  getOpenAIApiKey,
  getOpenAIEmbeddingModel,
} from '@/infrastructure/config/env.config'

const REQUEST_TIMEOUT_MS = 30_000
const EMBEDDING_DIMENSIONS = 1536
const MAX_BATCH_SIZE = 100

export class OpenAIEmbeddingService implements IEmbeddingService {
  private readonly client: OpenAI
  private readonly model: string

  constructor(
    apiKey: string = getOpenAIApiKey(),
    model: string = getOpenAIEmbeddingModel(),
  ) {
    if (!apiKey) {
      throw new EmbeddingFailedException('OPENAI_API_KEY is not configured')
    }
    this.client = new OpenAI({ apiKey, timeout: REQUEST_TIMEOUT_MS })
    this.model = model
  }

  getDimensions(): number {
    return EMBEDDING_DIMENSIONS
  }

  async embed(text: string): Promise<number[]> {
    const trimmed = text.trim()
    if (!trimmed) {
      throw new EmbeddingFailedException('Cannot embed empty text')
    }
    const [vector] = await this.embedBatch([trimmed])
    return vector
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    const cleaned = texts.map((t) => t.trim()).filter((t) => t.length > 0)
    if (cleaned.length === 0) {
      throw new EmbeddingFailedException('No non-empty texts to embed')
    }

    try {
      const result: number[][] = []
      for (let i = 0; i < cleaned.length; i += MAX_BATCH_SIZE) {
        const batch = cleaned.slice(i, i + MAX_BATCH_SIZE)
        const response = await this.client.embeddings.create({
          model: this.model,
          input: batch,
        })
        for (const item of response.data) {
          result.push(item.embedding)
        }
      }
      return result
    } catch (error) {
      console.error('[OpenAIEmbeddingService] request failed:', error)
      const message = error instanceof Error ? error.message : 'Unknown error'
      throw new EmbeddingFailedException(message)
    }
  }
}
