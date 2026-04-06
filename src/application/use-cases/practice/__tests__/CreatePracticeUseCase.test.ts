import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreatePracticeUseCase } from '../CreatePracticeUseCase'
import { PracticeEntity } from '@/domain/entities'
import type { IPracticeRepository } from '@/application/ports/repositories'

const mockPractice = {
  id: '1',
  title: 'Build a RAG',
  description: 'Practice description',
  content: null,
  type: 'rag' as const,
  playlist_id: 'playlist-1',
  tool_id: 'tool-1',
  user_id: 'user-1',
  created_at: '2024-01-01',
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

describe('CreatePracticeUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a practice successfully', async () => {
    const entitySpy = vi.spyOn(PracticeEntity, 'create')
    vi.mocked(mockRepo.create).mockResolvedValue(mockPractice)

    const useCase = new CreatePracticeUseCase(mockRepo)
    const result = await useCase.execute({
      title: 'Build a RAG',
      description: 'Practice description',
      type: 'rag',
      playlistId: 'playlist-1',
      toolId: 'tool-1',
      userId: 'user-1',
    })

    expect(result).toEqual(mockPractice)
    expect(entitySpy).toHaveBeenCalledWith({
      title: 'Build a RAG',
      description: 'Practice description',
      type: 'rag',
      playlistId: 'playlist-1',
      toolId: 'tool-1',
    })
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('throws if title is shorter than 3 characters', async () => {
    const useCase = new CreatePracticeUseCase(mockRepo)

    await expect(useCase.execute({ title: 'AB' })).rejects.toThrow(
      'Practice title must be at least 3 characters'
    )
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  it('maps userId, playlistId, and toolId to snake_case', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(mockPractice)

    const useCase = new CreatePracticeUseCase(mockRepo)

    await useCase.execute({
      title: 'Build a RAG',
      playlistId: 'playlist-1',
      toolId: 'tool-1',
      userId: 'user-1',
    })

    expect(mockRepo.create).toHaveBeenCalledWith({
      title: 'Build a RAG',
      description: null,
      content: null,
      type: null,
      playlist_id: 'playlist-1',
      tool_id: 'tool-1',
      user_id: 'user-1',
    })
  })
})
