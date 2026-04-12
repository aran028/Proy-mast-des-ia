import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetVideosByPlaylistUseCase } from '../GetVideosByPlayListUseCase'
import type { VideoRepository } from '@/application/ports/repositories'
import { VideoEntity } from '@/domain/entities/video.entity'

const mockVideos = [
  new VideoEntity({
    id: 'vid-1',
    playlistId: 'playlist-1',
    toolId: null,
    title: 'Playlist Video',
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

describe('GetVideosByPlaylistUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns videos for a given playlist', async () => {
    vi.mocked(mockRepo.findByPlaylistId).mockResolvedValue(mockVideos)

    const useCase = new GetVideosByPlaylistUseCase(mockRepo)
    const result = await useCase.execute('playlist-1')

    expect(result).toEqual(mockVideos)
    expect(mockRepo.findByPlaylistId).toHaveBeenCalledWith('playlist-1')
  })

  it('throws if playlistId is empty', async () => {
    const useCase = new GetVideosByPlaylistUseCase(mockRepo)

    await expect(useCase.execute('')).rejects.toThrow('Playlist ID is required')
    expect(mockRepo.findByPlaylistId).not.toHaveBeenCalled()
  })
})
