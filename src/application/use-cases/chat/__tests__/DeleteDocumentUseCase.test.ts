import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteDocumentUseCase } from '../DeleteDocumentUseCase'
import type {
  IDocumentRepository,
  IVectorRepository,
} from '@/application/ports/repositories'
import { DocumentNotFoundException } from '@/domain/exceptions'

const mockDocRepo: IDocumentRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
}

const mockVectorRepo: IVectorRepository = {
  search: vi.fn(),
  upsert: vi.fn(),
  deleteBySource: vi.fn(),
  deleteByDocument: vi.fn(),
}

describe('DeleteDocumentUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes vectors and document when found', async () => {
    vi.mocked(mockDocRepo.findById).mockResolvedValue({
      id: 'doc-1',
      title: 'Doc',
      filename: 'a.md',
      mime_type: 'text/markdown',
      size_bytes: 10,
      uploaded_by: null,
      created_at: '2026-04-28T00:00:00Z',
    })

    const useCase = new DeleteDocumentUseCase(mockDocRepo, mockVectorRepo)
    await useCase.execute('doc-1')

    expect(mockVectorRepo.deleteByDocument).toHaveBeenCalledWith('doc-1')
    expect(mockDocRepo.delete).toHaveBeenCalledWith('doc-1')
  })

  it('throws DocumentNotFoundException when document does not exist', async () => {
    vi.mocked(mockDocRepo.findById).mockResolvedValue(null)

    const useCase = new DeleteDocumentUseCase(mockDocRepo, mockVectorRepo)
    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      DocumentNotFoundException,
    )
    expect(mockVectorRepo.deleteByDocument).not.toHaveBeenCalled()
    expect(mockDocRepo.delete).not.toHaveBeenCalled()
  })
})
