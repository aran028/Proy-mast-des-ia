import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetPracticesByToolUseCase } from '../GetPracticesByToolUseCase'
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

describe('GetPracticesByToolUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns practices for a tool', async () => {
    vi.mocked(mockRepo.findByToolId).mockResolvedValue([mockPractice])

    const useCase = new GetPracticesByToolUseCase(mockRepo)
    const result = await useCase.execute('tool-1')

    expect(result).toEqual([mockPractice])
    expect(mockRepo.findByToolId).toHaveBeenCalledWith('tool-1')
  })

  it('returns empty array when no practices for tool', async () => {
    vi.mocked(mockRepo.findByToolId).mockResolvedValue([])

    const useCase = new GetPracticesByToolUseCase(mockRepo)
    const result = await useCase.execute('tool-empty')

    expect(result).toEqual([])
    expect(mockRepo.findByToolId).toHaveBeenCalledWith('tool-empty')
  })
})
