import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeletePracticeUseCase } from '../DeletePracticeUseCase'
import { PracticeNotFoundException } from '@/domain/exceptions'
import type { IPracticeRepository } from '@/application/ports/repositories'

const mockPractice = {
  id: '1',
  title: 'Build a RAG',
  description: null,
  content: null,
  type: null,
  playlist_id: 'playlist-1',
  tool_id: 'tool-1',
  user_id: null,
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

describe('DeletePracticeUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a practice successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockPractice)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    const useCase = new DeletePracticeUseCase(mockRepo)

    await useCase.execute('1')

    expect(mockRepo.findById).toHaveBeenCalledWith('1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
    expect(mockRepo.delete).toHaveBeenCalledOnce()
  })

  it('throws PracticeNotFoundException if practice does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new DeletePracticeUseCase(mockRepo)

    await expect(useCase.execute('999')).rejects.toThrow(PracticeNotFoundException)
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
