import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreatePlaylistUseCase } from '../CreatePlaylistUseCase'
import type { IPlaylistRepository } from '@/application/ports/repositories'

const mockPlaylist = {
  id: '1', name: 'NLP', description: null, icon: null,
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

describe('CreatePlaylistUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a playlist successfully', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(mockPlaylist)
    const useCase = new CreatePlaylistUseCase(mockRepo)
    const result = await useCase.execute({ name: 'NLP' })
    expect(result).toEqual(mockPlaylist)
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('throws if name is too short', async () => {
    const useCase = new CreatePlaylistUseCase(mockRepo)
    await expect(useCase.execute({ name: 'A' })).rejects.toThrow(
      'Playlist name must be at least 2 characters'
    )
    expect(mockRepo.create).not.toHaveBeenCalled()
  })
})
