import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetToolsByPlaylistUseCase } from '../GetToolsByPlaylistUseCase'
import type { IToolRepository } from '@/application/ports/repositories'

const mockTool = {
  id: '1', name: 'ChatGPT', summary: null, image: null, website: null,
  tags: null, playlist_id: 'playlist-1', user_id: null, created_at: '2024-01-01', updated_at: null,
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

describe('GetToolsByPlaylistUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns tools for a playlist', async () => {
    vi.mocked(mockRepo.findByPlaylistId).mockResolvedValue([mockTool])
    const useCase = new GetToolsByPlaylistUseCase(mockRepo)
    const result = await useCase.execute('playlist-1')
    expect(result).toEqual([mockTool])
    expect(mockRepo.findByPlaylistId).toHaveBeenCalledWith('playlist-1')
  })

  it('returns empty array when no tools in playlist', async () => {
    vi.mocked(mockRepo.findByPlaylistId).mockResolvedValue([])
    const useCase = new GetToolsByPlaylistUseCase(mockRepo)
    const result = await useCase.execute('playlist-empty')
    expect(result).toEqual([])
  })
})
