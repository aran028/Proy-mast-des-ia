import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeleteToolUseCase } from '../DeleteToolUseCase'
import { ToolNotFoundException } from '@/domain/exceptions'
import type { IToolRepository } from '@/application/ports/repositories'

const mockTool = {
  id: '1',
  name: 'ChatGPT',
  summary: null,
  image: null,
  website: null,
  tags: null,
  playlist_id: null,
  user_id: null,
  created_at: '2024-01-01',
  updated_at: null,
}

const mockRepo: IToolRepository = {
  findAll: vi.fn(),
  findById: vi.fn(),
  findByPlaylistId: vi.fn(),
  findByUserId: vi.fn(),
  findByPromptSupport: vi.fn(),
  search: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}

describe('DeleteToolUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('deletes a tool successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockTool)
    vi.mocked(mockRepo.delete).mockResolvedValue(undefined)

    const useCase = new DeleteToolUseCase(mockRepo)

    await useCase.execute('1')

    expect(mockRepo.findById).toHaveBeenCalledWith('1')
    expect(mockRepo.delete).toHaveBeenCalledWith('1')
    expect(mockRepo.delete).toHaveBeenCalledOnce()
  })

  it('throws ToolNotFoundException if tool does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new DeleteToolUseCase(mockRepo)

    await expect(useCase.execute('999')).rejects.toThrow(ToolNotFoundException)
    expect(mockRepo.delete).not.toHaveBeenCalled()
  })
})
