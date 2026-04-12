import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateVideoUseCase } from '../CreateVideoUseCase'
import { VideoEntity } from '@/domain/entities/video.entity'
import type { VideoRepository } from '@/application/ports/repositories'

const mockVideo = new VideoEntity({
  id: 'vid-1',
  playlistId: 'playlist-1',
  toolId: null,
  title: 'Test Video',
  description: null,
  thumbnailUrl: null,
  videoUrl: 'https://youtube.com/watch?v=abc123',
  platform: 'youtube',
  platformVideoId: 'abc123',
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

describe('CreateVideoUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a video successfully', async () => {
    const entitySpy = vi.spyOn(VideoEntity, 'create')
    vi.mocked(mockRepo.findByPlatformVideoId).mockResolvedValue(null)
    vi.mocked(mockRepo.create).mockResolvedValue(mockVideo)

    const useCase = new CreateVideoUseCase(mockRepo)
    const result = await useCase.execute({
      title: 'Test Video',
      videoUrl: 'https://youtube.com/watch?v=abc123',
      platform: 'youtube',
      platformVideoId: 'abc123',
      playlistId: 'playlist-1',
    })

    expect(result.video).toEqual(mockVideo)
    expect(result.created).toBe(true)
    expect(entitySpy).toHaveBeenCalled()
    expect(mockRepo.findByPlatformVideoId).toHaveBeenCalledWith('abc123')
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('returns existing video without creating if duplicate', async () => {
    vi.mocked(mockRepo.findByPlatformVideoId).mockResolvedValue(mockVideo)

    const useCase = new CreateVideoUseCase(mockRepo)
    const result = await useCase.execute({
      title: 'Test Video',
      videoUrl: 'https://youtube.com/watch?v=abc123',
      platform: 'youtube',
      platformVideoId: 'abc123',
    })

    expect(result.video).toEqual(mockVideo)
    expect(result.created).toBe(false)
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  it('throws if title is shorter than 3 characters', async () => {
    vi.mocked(mockRepo.findByPlatformVideoId).mockResolvedValue(null)

    const useCase = new CreateVideoUseCase(mockRepo)

    await expect(
      useCase.execute({
        title: 'AB',
        videoUrl: 'https://youtube.com/watch?v=x',
        platform: 'youtube',
        platformVideoId: 'x',
      })
    ).rejects.toThrow('Video title must be at least 3 characters')
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  it('throws if videoUrl is empty', async () => {
    vi.mocked(mockRepo.findByPlatformVideoId).mockResolvedValue(null)

    const useCase = new CreateVideoUseCase(mockRepo)

    await expect(
      useCase.execute({
        title: 'Valid Title',
        videoUrl: '',
        platform: 'youtube',
        platformVideoId: 'x',
      })
    ).rejects.toThrow('Video URL is required')
    expect(mockRepo.create).not.toHaveBeenCalled()
  })
})
