import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UpdatePracticeUseCase } from '../UpdatePracticeUseCase'
import { PracticeNotFoundException } from '@/domain/exceptions'
import type { IPracticeRepository } from '@/application/ports/repositories'

const mockPractice = {
  id: '1',
  title: 'Build a RAG',
  description: 'Old description',
  content: null,
  type: 'rag' as const,
  playlist_id: 'playlist-1',
  tool_id: 'tool-1',
  user_id: 'user-1',
  created_at: '2024-01-01T00:00:00.000Z',
}

const updatedPractice = {
  ...mockPractice,
  title: 'Build an Agent',
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

describe('UpdatePracticeUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('updates a practice successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPractice)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedPractice)

    const useCase = new UpdatePracticeUseCase(mockRepo)
    const result = await useCase.execute('1', {
      title: 'Build an Agent',
      description: 'New description',
      content: { steps: ['step-1'] },
      type: 'automation',
      toolId: 'tool-2',
      playlistId: 'playlist-2',
    })

    expect(result).toEqual(updatedPractice)
    expect(mockRepo.findById).toHaveBeenCalledWith('1')
    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      title: 'Build an Agent',
      description: 'New description',
      content: { steps: ['step-1'] },
      type: 'automation',
      tool_id: 'tool-2',
      playlist_id: 'playlist-2',
    })
  })

  it('throws PracticeNotFoundException if practice does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new UpdatePracticeUseCase(mockRepo)

    await expect(useCase.execute('999', { title: 'Build an Agent' })).rejects.toThrow(PracticeNotFoundException)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws if title is shorter than 3 characters', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPractice)

    const useCase = new UpdatePracticeUseCase(mockRepo)

    await expect(useCase.execute('1', { title: 'AB' })).rejects.toThrow(
      'Practice title must be at least 3 characters'
    )
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('only sends provided fields to repository', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPractice)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedPractice)

    const useCase = new UpdatePracticeUseCase(mockRepo)

    await useCase.execute('1', { title: 'Build an Agent' })

    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      title: 'Build an Agent',
    })
  })
})
