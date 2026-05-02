import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IndexDocumentUseCase } from '../IndexDocumentUseCase'
import type {
  IDocumentRepository,
  IVectorRepository,
} from '@/application/ports/repositories'
import type { IEmbeddingService } from '@/application/ports/services'
import { ValidationException } from '@/domain/exceptions'

const mockDocRepo: IDocumentRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}

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

describe('IndexDocumentUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('extracts, chunks, embeds and stores a markdown document', async () => {
    const longText = ('Section A.\n' + 'a'.repeat(2000)).repeat(2)
    const buffer = Buffer.from(longText, 'utf-8')

    vi.mocked(mockDocRepo.create).mockResolvedValue({
      id: 'doc-1',
      title: 'Manual',
      filename: 'manual.md',
      mime_type: 'text/markdown',
      size_bytes: buffer.length,
      uploaded_by: 'user-1',
      created_at: '2026-04-28T00:00:00Z',
    })
    vi.mocked(mockEmbedding.embedBatch).mockImplementation(async (texts) =>
      texts.map(() => Array(1536).fill(0.1)),
    )

    const useCase = new IndexDocumentUseCase(
      mockDocRepo,
      mockEmbedding,
      mockVectorRepo,
    )

    const result = await useCase.execute({
      title: 'Manual',
      filename: 'manual.md',
      mimeType: 'text/markdown',
      buffer,
      uploadedBy: 'user-1',
    })

    expect(result.documentId).toBe('doc-1')
    expect(result.chunksIndexed).toBeGreaterThan(1)
    expect(mockDocRepo.create).toHaveBeenCalledOnce()
    expect(mockEmbedding.embedBatch).toHaveBeenCalledOnce()
    expect(mockVectorRepo.upsert).toHaveBeenCalledOnce()

    const upsertedRows = vi.mocked(mockVectorRepo.upsert).mock.calls[0][0]
    expect(upsertedRows[0].documentId).toBe('doc-1')
    expect(upsertedRows[0].sourceType).toBe('document')
  })

  it('throws ValidationException when title is empty', async () => {
    const useCase = new IndexDocumentUseCase(
      mockDocRepo,
      mockEmbedding,
      mockVectorRepo,
    )

    await expect(
      useCase.execute({
        title: '   ',
        filename: 'a.md',
        mimeType: 'text/markdown',
        buffer: Buffer.from('hola'),
        uploadedBy: null,
      }),
    ).rejects.toBeInstanceOf(ValidationException)
  })

  it('throws ValidationException when buffer is empty', async () => {
    const useCase = new IndexDocumentUseCase(
      mockDocRepo,
      mockEmbedding,
      mockVectorRepo,
    )

    await expect(
      useCase.execute({
        title: 'Doc',
        filename: 'a.md',
        mimeType: 'text/markdown',
        buffer: Buffer.alloc(0),
        uploadedBy: null,
      }),
    ).rejects.toBeInstanceOf(ValidationException)
  })
})
