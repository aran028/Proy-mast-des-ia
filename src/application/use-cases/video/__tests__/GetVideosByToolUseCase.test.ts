import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetVideosByToolUseCase } from '../GetVideosByToolUseCase'
import type { VideoRepository } from '@/application/ports/repositories'
import { VideoEntity } from '@/domain/entities/video.entity'

const mockVideos = [
  new VideoEntity({
    id: 'vid-1',
    playlistId: null,
    toolId: 'tool-1',
    title: 'Tool Video',
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

describe('GetVideosByToolUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns videos for a given tool', async () => {
    vi.mocked(mockRepo.findByToolId).mockResolvedValue(mockVideos)

    const useCase = new GetVideosByToolUseCase(mockRepo)
    const result = await useCase.execute('tool-1')

    expect(result).toEqual(mockVideos)
    expect(mockRepo.findByToolId).toHaveBeenCalledWith('tool-1')
  })

  it('throws if toolId is empty', async () => {
    const useCase = new GetVideosByToolUseCase(mockRepo)

    await expect(useCase.execute('')).rejects.toThrow('Tool ID is required')
    expect(mockRepo.findByToolId).not.toHaveBeenCalled()
  })
})
