import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdateVideoUseCase } from '../UpdateVideoUseCase'
import type { VideoRepository } from '@/application/ports/repositories'
import { VideoEntity } from '@/domain/entities/video.entity'

const mockVideo = new VideoEntity({
  id: 'vid-1',
  playlistId: null,
  toolId: null,
  title: 'Original Title',
  description: null,
  thumbnailUrl: null,
  videoUrl: 'https://youtube.com/watch?v=abc',
  platform: 'youtube',
  platformVideoId: 'abc',
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

const updatedVideo = new VideoEntity({
  ...mockVideo,
  title: 'Updated Title',
  updatedAt: '2024-02-01',
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

describe('UpdateVideoUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates a video successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockVideo)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedVideo)

    const useCase = new UpdateVideoUseCase(mockRepo)
    const result = await useCase.execute('vid-1', { title: 'Updated Title' })

    expect(result).toEqual(updatedVideo)
    expect(mockRepo.findById).toHaveBeenCalledWith('vid-1')
    expect(mockRepo.update).toHaveBeenCalledWith('vid-1', { title: 'Updated Title' })
  })

  it('throws if video does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new UpdateVideoUseCase(mockRepo)

    await expect(useCase.execute('999', { title: 'X' })).rejects.toThrow('Video not found')
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws if id is empty', async () => {
    const useCase = new UpdateVideoUseCase(mockRepo)

    await expect(useCase.execute('', { title: 'X' })).rejects.toThrow('Video ID is required')
    expect(mockRepo.findById).not.toHaveBeenCalled()
  })
})
