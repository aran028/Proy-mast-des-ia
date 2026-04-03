import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetPlaylistByIdUseCase } from '../GetPlaylistByIdUseCase'
import { PlaylistNotFoundException } from '@/domain/exceptions'
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

describe('GetPlaylistByIdUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns playlist when found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPlaylist)
    const useCase = new GetPlaylistByIdUseCase(mockRepo)
    const result = await useCase.execute('1')
    expect(result).toEqual(mockPlaylist)
    expect(mockRepo.findById).toHaveBeenCalledWith('1')
  })

  it('throws PlaylistNotFoundException when not found', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)
    const useCase = new GetPlaylistByIdUseCase(mockRepo)
    await expect(useCase.execute('999')).rejects.toThrow(PlaylistNotFoundException)
  })
})
