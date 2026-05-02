import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AskChatbotUseCase } from '../AskChatbotUseCase'
import type { IVectorRepository } from '@/application/ports/repositories'
import type {
  IChatService,
  IEmbeddingService,
} from '@/application/ports/services'
import { RetrievedChunk } from '@/domain/value-objects'
import { ValidationException } from '@/domain/exceptions'

const mockEmbedding: IEmbeddingService = {
  embed: vi.fn(),
  embedBatch: vi.fn(),
  getDimensions: vi.fn(() => 1536),
}

const mockVectorRepo: IVectorRepository = {
  search: vi.fn(),
  upsert: vi.fn(),
  deleteBySource: vi.fn(),
  deleteByDocument: vi.fn(),
}

async function* fakeStream(text: string): AsyncIterable<string> {
  for (const word of text.split(' ')) {
    yield word + ' '
  }
}

const mockChatService: IChatService = {
  stream: vi.fn(),
}

describe('AskChatbotUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('embeds the last user message and retrieves context before streaming', async () => {
    const fakeVector = Array(1536).fill(0.1)
    const chunk = RetrievedChunk.create({
      id: 'chunk-1',
      sourceType: 'tool',
      sourceId: 'tool-1',
      documentId: null,
      content: 'ChatGPT is an AI assistant',
      similarity: 0.9,
      metadata: { name: 'ChatGPT' },
    })

    vi.mocked(mockEmbedding.embed).mockResolvedValue(fakeVector)
    vi.mocked(mockVectorRepo.search).mockResolvedValue([chunk])
    vi.mocked(mockChatService.stream).mockReturnValue(fakeStream('Hola mundo'))

    const useCase = new AskChatbotUseCase(
      mockEmbedding,
      mockVectorRepo,
      mockChatService,
    )

    const result = await useCase.execute({
      messages: [
        { role: 'user', content: 'Recomiéndame una herramienta de IA' },
      ],
    })

    expect(mockEmbedding.embed).toHaveBeenCalledWith(
      'Recomiéndame una herramienta de IA',
    )
    expect(mockVectorRepo.search).toHaveBeenCalledWith(fakeVector, 0.3, 15)
    expect(mockChatService.stream).toHaveBeenCalledWith({
      messages: expect.any(Array),
      context: [chunk],
      attachedDocument: null,
    })

    let assembled = ''
    for await (const piece of result) assembled += piece
    expect(assembled.trim()).toBe('Hola mundo')
  })

  it('combines recent user turns into the retrieval query so follow-ups keep entity context', async () => {
    vi.mocked(mockEmbedding.embed).mockResolvedValue([0.1, 0.2])
    vi.mocked(mockVectorRepo.search).mockResolvedValue([])
    vi.mocked(mockChatService.stream).mockReturnValue(fakeStream('ok'))

    const useCase = new AskChatbotUseCase(
      mockEmbedding,
      mockVectorRepo,
      mockChatService,
    )

    await useCase.execute({
      messages: [
        { role: 'user', content: 'Pregunta original' },
        { role: 'assistant', content: 'Respuesta anterior' },
        { role: 'user', content: 'Mi nueva pregunta' },
      ],
    })

    expect(mockEmbedding.embed).toHaveBeenCalledWith(
      'Pregunta original\nMi nueva pregunta',
    )
  })

  it('propagates attachedDocument to the chat service when provided', async () => {
    vi.mocked(mockEmbedding.embed).mockResolvedValue([0.1])
    vi.mocked(mockVectorRepo.search).mockResolvedValue([])
    vi.mocked(mockChatService.stream).mockReturnValue(fakeStream('ok'))

    const useCase = new AskChatbotUseCase(
      mockEmbedding,
      mockVectorRepo,
      mockChatService,
    )

    const attached = { name: 'manual.md', content: 'contenido del manual' }
    await useCase.execute({
      messages: [{ role: 'user', content: 'qué dice el manual?' }],
      attachedDocument: attached,
    })

    expect(mockChatService.stream).toHaveBeenCalledWith(
      expect.objectContaining({ attachedDocument: attached }),
    )
  })

  it('respects custom matchThreshold and matchCount', async () => {
    vi.mocked(mockEmbedding.embed).mockResolvedValue([0.1])
    vi.mocked(mockVectorRepo.search).mockResolvedValue([])
    vi.mocked(mockChatService.stream).mockReturnValue(fakeStream(''))

    const useCase = new AskChatbotUseCase(
      mockEmbedding,
      mockVectorRepo,
      mockChatService,
    )

    await useCase.execute({
      messages: [{ role: 'user', content: 'hola' }],
      matchThreshold: 0.85,
      matchCount: 3,
    })

    expect(mockVectorRepo.search).toHaveBeenCalledWith(
      expect.any(Array),
      0.85,
      3,
    )
  })

  it('throws ValidationException when messages array is empty', async () => {
    const useCase = new AskChatbotUseCase(
      mockEmbedding,
      mockVectorRepo,
      mockChatService,
    )

    await expect(useCase.execute({ messages: [] })).rejects.toBeInstanceOf(
      ValidationException,
    )
    expect(mockEmbedding.embed).not.toHaveBeenCalled()
  })

  it('throws ValidationException when there is no user message', async () => {
    const useCase = new AskChatbotUseCase(
      mockEmbedding,
      mockVectorRepo,
      mockChatService,
    )

    await expect(
      useCase.execute({
        messages: [{ role: 'assistant', content: 'Hola, soy el bot' }],
      }),
    ).rejects.toBeInstanceOf(ValidationException)
    expect(mockEmbedding.embed).not.toHaveBeenCalled()
  })
})
