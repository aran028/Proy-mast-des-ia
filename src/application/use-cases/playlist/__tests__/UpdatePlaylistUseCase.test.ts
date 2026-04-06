import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UpdatePlaylistUseCase } from '../UpdatePlaylistUseCase'
import { PlaylistNotFoundException } from '@/domain/exceptions'
import type { IPlaylistRepository } from '@/application/ports/repositories'

const mockPlaylist = {
  id: '1',
  name: 'Original',
  description: 'Old description',
  icon: 'book',
  color: '#000000',
  user_id: null,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const updatedPlaylist = {
  ...mockPlaylist,
  name: 'New',
  updated_at: '2025-01-01T10:00:00.000Z',
}

const mockRepo: IPlaylistRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByUserId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('UpdatePlaylistUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates a playlist successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPlaylist)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedPlaylist)

    const useCase = new UpdatePlaylistUseCase(mockRepo)
    const result = await useCase.execute('1', {
      name: 'New',
      description: 'New description',
      icon: 'brain',
      color: '#ffffff',
    })

    expect(result).toEqual(updatedPlaylist)
    expect(mockRepo.findById).toHaveBeenCalledWith('1')
    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      name: 'New',
      description: 'New description',
      icon: 'brain',
      color: '#ffffff',
      updated_at: '2025-01-01T10:00:00.000Z',
    })
  })

  it('throws PlaylistNotFoundException if playlist does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new UpdatePlaylistUseCase(mockRepo)

    await expect(useCase.execute('999', { name: 'New' })).rejects.toThrow(PlaylistNotFoundException)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws if name is shorter than 2 characters', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPlaylist)

    const useCase = new UpdatePlaylistUseCase(mockRepo)

    await expect(useCase.execute('1', { name: 'A' })).rejects.toThrow(
      'Playlist name must be at least 2 characters'
    )
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('only sends provided fields to repository', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPlaylist)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedPlaylist)

    const useCase = new UpdatePlaylistUseCase(mockRepo)

    await useCase.execute('1', { name: 'New' })

    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      name: 'New',
      updated_at: '2025-01-01T10:00:00.000Z',
    })
  })
})
