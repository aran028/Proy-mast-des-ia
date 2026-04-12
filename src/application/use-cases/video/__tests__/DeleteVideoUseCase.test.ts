import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteVideoUseCase } from '../DeleteVideoUseCase'
import type { VideoRepository } from '@/application/ports/repositories'
import { VideoEntity } from '@/domain/entities/video.entity'

const mockVideo = new VideoEntity({
  id: 'vid-1',
  playlistId: null,
  toolId: null,
  title: 'Video to Delete',
  description: null,
  thumbnailUrl: null,
  videoUrl: 'https://youtube.com/watch?v=del',
  platform: 'youtube',
  platformVideoId: 'del',
  author: null,
  authorUrl: null,
  duration: null,
  viewCount: null,
  publishedAt: null,
  tags: null,
  aiClassified: false,
  classificationConfidence: null,
  status: 'approved',
  createdAt: '2024-01-01',
  updatedAt: null,
})

const mockRepo: VideoRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByPlaylistId: vi.fn(),
  findByToolId: vi.fn(),
  findByPlatform: vi.fn(),
  findByPlatformVideoId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('DeleteVideoUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a video successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockVideo)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    const useCase = new DeleteVideoUseCase(mockRepo)
    await useCase.execute('vid-1')

    expect(mockRepo.findById).toHaveBeenCalledWith('vid-1')
    expect(mockRepo.delete).toHaveBeenCalledWith('vid-1')
    expect(mockRepo.delete).toHaveBeenCalledOnce()
  })

  it('throws if video does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new DeleteVideoUseCase(mockRepo)

    await expect(useCase.execute('999')).rejects.toThrow('Video not found')
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })

  it('throws if id is empty', async () => {
    const useCase = new DeleteVideoUseCase(mockRepo)

    await expect(useCase.execute('')).rejects.toThrow('Video ID is required')
    expect(mockRepo.findById).not.toHaveBeenCalled()
  })
})
