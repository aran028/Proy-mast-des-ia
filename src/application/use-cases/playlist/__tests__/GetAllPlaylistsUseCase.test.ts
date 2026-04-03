import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAllPlaylistsUseCase } from '../GetAllPlaylistUseCase'
import type { IPlaylistRepository } from '@/application/ports/repositories'

const mockPlaylist = {
  id: '1', name: 'ML', description: null, icon: null,
  color: null, user_id: null, created_at: '2024-01-01', updated_at: null,
}

const mockRepo: IPlaylistRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('GetAllPlaylistsUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns all playlists', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([mockPlaylist])
    const useCase = new GetAllPlaylistsUseCase(mockRepo)
    const result = await useCase.execute()
    expect(result).toEqual([mockPlaylist])
    expect(mockRepo.findAll).toHaveBeenCalledOnce()
  })

  it('returns empty array when no playlists', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([])
    const useCase = new GetAllPlaylistsUseCase(mockRepo)
    const result = await useCase.execute()
    expect(result).toEqual([])
  })
})
