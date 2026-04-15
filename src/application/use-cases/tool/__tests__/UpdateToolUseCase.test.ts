import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { UpdateToolUseCase } from '../UpdateToolUseCase'
import { ToolNotFoundException } from '@/domain/exceptions'
import type { IToolRepository } from '@/application/ports/repositories'

const mockTool = {
  id: '1',
  name: 'ChatGPT',
  summary: 'AI assistant',
  image: 'image.png',
  website: 'https://openai.com',
  tags: ['ai'],
  playlist_id: 'playlist-1',
  user_id: 'user-1',
  supports_prompt: false,
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}

const updatedTool = {
  ...mockTool,
  name: 'Claude',
  updated_at: '2025-01-01T10:00:00.000Z',
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

describe('UpdateToolUseCase', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T10:00:00.000Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('updates a tool successfully', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockTool)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedTool)

    const useCase = new UpdateToolUseCase(mockRepo)
    const result = await useCase.execute('1', {
      name: 'Claude',
      summary: 'New summary',
      image: 'new.png',
      website: 'https://example.com',
      tags: ['llm', 'assistant'],
      playlistId: 'playlist-2',
    })

    expect(result).toEqual(updatedTool)
    expect(mockRepo.findById).toHaveBeenCalledWith('1')
    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      name: 'Claude',
      summary: 'New summary',
      image: 'new.png',
      website: 'https://example.com',
      tags: ['llm', 'assistant'],
      playlist_id: 'playlist-2',
      updated_at: '2025-01-01T10:00:00.000Z',
    })
  })

  it('throws ToolNotFoundException if tool does not exist', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(null)

    const useCase = new UpdateToolUseCase(mockRepo)

    await expect(useCase.execute('999', { name: 'Claude' })).rejects.toThrow(ToolNotFoundException)
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('throws if name is shorter than 2 characters', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockTool)

    const useCase = new UpdateToolUseCase(mockRepo)

    await expect(useCase.execute('1', { name: 'A' })).rejects.toThrow(
      'Tool name must be at least 2 characters'
    )
    expect(mockRepo.update).not.toHaveBeenCalled()
  })

  it('only sends provided fields to repository', async () => {
    vi.mocked(mockRepo.findById).mockResolvedValue(mockTool)
    vi.mocked(mockRepo.update).mockResolvedValue(updatedTool)

    const useCase = new UpdateToolUseCase(mockRepo)

    await useCase.execute('1', { name: 'Claude' })

    expect(mockRepo.update).toHaveBeenCalledWith('1', {
      name: 'Claude',
      updated_at: '2025-01-01T10:00:00.000Z',
    })
  })
})
