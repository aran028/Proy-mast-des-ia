import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetPracticesByPlaylistUseCase } from '../GetPracticesByPlaylistUseCase'
import type { IPracticeRepository } from '@/application/ports/repositories'

const mockPractice = {
  id: '1', title: 'Build a RAG', description: null, content: null,
  type: null, playlist_id: 'playlist-1', tool_id: null, created_at: '2024-01-01',
}

const mockRepo: IPracticeRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByPlaylistId: vi.fn(),
  findByToolId: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('GetPracticesByPlaylistUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns practices for a playlist', async () => {
    vi.mocked(mockRepo.findByPlaylistId).mockResolvedValue([mockPractice])
    const useCase = new GetPracticesByPlaylistUseCase(mockRepo)
    const result = await useCase.execute('playlist-1')
    expect(result).toEqual([mockPractice])
    expect(mockRepo.findByPlaylistId).toHaveBeenCalledWith('playlist-1')
  })

  it('returns empty array when no practices in playlist', async () => {
    vi.mocked(mockRepo.findByPlaylistId).mockResolvedValue([])
    const useCase = new GetPracticesByPlaylistUseCase(mockRepo)
    const result = await useCase.execute('playlist-empty')
    expect(result).toEqual([])
  })
})
