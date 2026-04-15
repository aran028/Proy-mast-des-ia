import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateToolUseCase } from '../CreateToolUseCase'
import { ToolEntity } from '@/domain/entities'
import type { IToolRepository } from '@/application/ports/repositories'

const mockTool = {
  id: '1',
  name: 'ChatGPT',
  summary: 'AI assistant',
  image: null,
  website: 'https://openai.com',
  tags: null,
  playlist_id: 'playlist-1',
  user_id: 'user-1',
  supports_prompt: false,
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

describe('CreateToolUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates a tool successfully', async () => {
    const entitySpy = vi.spyOn(ToolEntity, 'create')
    vi.mocked(mockRepo.create).mockResolvedValue(mockTool)

    const useCase = new CreateToolUseCase(mockRepo)
    const result = await useCase.execute({
      name: 'ChatGPT',
      summary: 'AI assistant',
      website: 'https://openai.com',
      playlistId: 'playlist-1',
      userId: 'user-1',
    })

    expect(result).toEqual(mockTool)
    expect(entitySpy).toHaveBeenCalledWith({
      name: 'ChatGPT',
      summary: 'AI assistant',
      website: 'https://openai.com',
      playlistId: 'playlist-1',
    })
    expect(mockRepo.create).toHaveBeenCalledOnce()
  })

  it('throws if name is shorter than 2 characters', async () => {
    const useCase = new CreateToolUseCase(mockRepo)

    await expect(useCase.execute({ name: 'A' })).rejects.toThrow(
      'Tool name must be at least 2 characters'
    )
    expect(mockRepo.create).not.toHaveBeenCalled()
  })

  it('maps userId to user_id and playlistId to playlist_id', async () => {
    vi.mocked(mockRepo.create).mockResolvedValue(mockTool)

    const useCase = new CreateToolUseCase(mockRepo)

    await useCase.execute({
      name: 'ChatGPT',
      playlistId: 'playlist-1',
      userId: 'user-1',
    })

    expect(mockRepo.create).toHaveBeenCalledWith({
      name: 'ChatGPT',
      summary: null,
      image: null,
      tags: null,
      website: null,
      supports_prompt: false,
      playlist_id: 'playlist-1',
      user_id: 'user-1',
    })
  })
})
