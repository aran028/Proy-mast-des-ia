import { z } from 'zod'
import type { IVectorRepository } from '@/application/ports/repositories'
import type {
  IChatService,
  IEmbeddingService,
} from '@/application/ports/services'
import { ChatMessage } from '@/domain/value-objects'
import { ValidationException } from '@/domain/exceptions'

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(8000),
})

const ATTACHED_DOCUMENT_MAX_CHARS = 50_000

const attachedDocumentSchema = z
  .object({
    name: z.string().min(1).max(255),
    content: z.string().min(1).max(ATTACHED_DOCUMENT_MAX_CHARS),
  })
  .nullable()
  .optional()

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  matchThreshold: z.number().min(0).max(1).optional(),
  matchCount: z.number().int().min(1).max(50).optional(),
  attachedDocument: attachedDocumentSchema,
})

export type AskChatbotInput = z.infer<typeof inputSchema>

const DEFAULT_THRESHOLD = 0.3
const DEFAULT_MATCH_COUNT = 15

export class AskChatbotUseCase {
  constructor(
    private readonly embeddingService: IEmbeddingService,
    private readonly vectorRepository: IVectorRepository,
    private readonly chatService: IChatService,
  ) {}

  async execute(input: AskChatbotInput): Promise<AsyncIterable<string>> {
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationException(parsed.error.issues[0]?.message ?? 'Invalid input')
    }

    const messages = parsed.data.messages.map((m) =>
      ChatMessage.create(m.role, m.content),
    )

    const userMessages = messages.filter((m) => m.getRole() === 'user')
    if (userMessages.length === 0) {
      throw new ValidationException('At least one user message is required')
    }

    const retrievalQuery = userMessages
      .slice(-3)
      .map((m) => m.getContent())
      .join('\n')

    const queryEmbedding = await this.embeddingService.embed(retrievalQuery)

    const context = await this.vectorRepository.search(
      queryEmbedding,
      parsed.data.matchThreshold ?? DEFAULT_THRESHOLD,
      parsed.data.matchCount ?? DEFAULT_MATCH_COUNT,
    )

    return this.chatService.stream({
      messages,
      context,
      attachedDocument: parsed.data.attachedDocument ?? null,
    })
  }
}
