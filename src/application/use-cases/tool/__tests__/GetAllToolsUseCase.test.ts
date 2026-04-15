import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAllToolsUseCase } from '../GetAllToolsUseCase'
import type { IToolRepository } from '@/application/ports/repositories'

const mockTools = [{
  id: '1',
  name: 'ChatGPT',
  summary: null,
  image: null,
  website: null,
  tags: null,
  playlist_id: null,
  user_id: null,
  supports_prompt: false,
  created_at: '2024-01-01',
  updated_at: null,
}]

const mockRepo: IToolRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByPlaylistId: vi.fn(),
  findByUserId: vi.fn(),
  findByPromptSupport: vi.fn(),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('GetAllToolsUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns all tools', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue(mockTools)

    const useCase = new GetAllToolsUseCase(mockRepo)
    const result = await useCase.execute()

    expect(result).toEqual(mockTools)
    expect(mockRepo.findAll).toHaveBeenCalledOnce()
  })

  it('returns empty array when no tools exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([])

    const useCase = new GetAllToolsUseCase(mockRepo)
    const result = await useCase.execute()

    expect(result).toEqual([])
    expect(mockRepo.findAll).toHaveBeenCalledOnce()
  })
})
