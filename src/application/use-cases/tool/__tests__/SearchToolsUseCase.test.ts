import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SearchToolsUseCase } from '../SearchToolsUseCase'
import type { IToolRepository } from '@/application/ports/repositories'

const mockTool = {
  id: '1', name: 'ChatGPT', summary: null, image: null, website: null,
  tags: null, playlist_id: null, user_id: null, created_at: '2024-01-01', updated_at: null,
}

const mockRepo: IToolRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByPlaylistId: vi.fn(),
  findByUserId: vi.fn(),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('SearchToolsUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns results for valid query', async () => {
    vi.mocked(mockRepo.search).mockResolvedValue([mockTool])
    const useCase = new SearchToolsUseCase(mockRepo)
    const result = await useCase.execute('Chat')
    expect(result).toEqual([mockTool])
    expect(mockRepo.search).toHaveBeenCalledWith('Chat')
  })

  it('returns empty array for empty query', async () => {
    const useCase = new SearchToolsUseCase(mockRepo)
    const result = await useCase.execute('')
    expect(result).toEqual([])
    expect(mockRepo.search).not.toHaveBeenCalled()
  })

  it('returns empty array for query shorter than 2 chars', async () => {
    const useCase = new SearchToolsUseCase(mockRepo)
    const result = await useCase.execute('A')
    expect(result).toEqual([])
    expect(mockRepo.search).not.toHaveBeenCalled()
  })
})
