import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetAllVideosUseCase } from '../GetAllVideosUseCase'
import type { VideoRepository } from '@/application/ports/repositories'
import { VideoEntity } from '@/domain/entities/video.entity'

const mockVideos = [
  new VideoEntity({
    id: 'vid-1',
    playlistId: null,
    toolId: null,
    title: 'Video 1',
    description: null,
    thumbnailUrl: null,
    videoUrl: 'https://youtube.com/watch?v=1',
    platform: 'youtube',
    platformVideoId: '1',
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
  }),
]

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

describe('GetAllVideosUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns all videos from repository', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue(mockVideos)

    const useCase = new GetAllVideosUseCase(mockRepo)
    const result = await useCase.execute()

    expect(result).toEqual(mockVideos)
    expect(mockRepo.findAll).toHaveBeenCalledOnce()
  })

  it('returns empty array when no videos exist', async () => {
    vi.mocked(mockRepo.findAll).mockResolvedValue([])

    const useCase = new GetAllVideosUseCase(mockRepo)
    const result = await useCase.execute()

    expect(result).toEqual([])
    expect(mockRepo.findAll).toHaveBeenCalledOnce()
  })
})
