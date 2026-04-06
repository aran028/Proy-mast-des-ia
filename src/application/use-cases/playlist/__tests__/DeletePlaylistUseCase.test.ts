import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeletePlaylistUseCase } from '../DeletePlaylistUseCase'
import { PlaylistNotFoundException } from '@/domain/exceptions'
import type { IPlaylistRepository } from '@/application/ports/repositories'

const mockPlaylist = {
  id: '1',
  name: 'ML',
  description: null,
  icon: null,
  color: null,
  user_id: null,
  created_at: '2024-01-01',
  updated_at: null,
}

const mockRepo: IPlaylistRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('DeletePlaylistUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a playlist successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPlaylist)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    const useCase = new DeletePlaylistUseCase(mockRepo)

    await useCase.execute('1')

    expect(mockRepo.findById).toHaveBeenCalledWith('1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
    expect(mockRepo.delete).toHaveBeenCalledOnce()
  })

  it('throws PlaylistNotFoundException if playlist does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new DeletePlaylistUseCase(mockRepo)

    await expect(useCase.execute('999')).rejects.toThrow(PlaylistNotFoundException)
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
