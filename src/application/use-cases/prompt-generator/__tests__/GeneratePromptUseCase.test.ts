import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GeneratePromptUseCase } from '../GeneratePromptUseCase'
import type { IToolRepository } from '@/application/ports/repositories'
import type { IPromptGeneratorService } from '@/application/ports/services'
import {
  ToolNotFoundException,
  ToolNotPromptEnabledException,
  ValidationException,
} from '@/domain/exceptions'

const mockTool = {
  id: 'tool-1',
  name: 'ChatGPT',
  summary: 'AI assistant by OpenAI',
  image: null,
  tags: null,
  website: 'https://chat.openai.com',
  supports_prompt: true,
  playlist_id: null,
  user_id: null,
  created_at: '2024-01-01',
  updated_at: '2024-01-01',
}

const mockToolRepo: IToolRepository = {
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

const mockPromptService: IPromptGeneratorService = {
  generate: vi.fn(),
}

describe('GeneratePromptUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('generates a prompt for a prompt-enabled tool', async () => {
    vi.mocked(mockToolRepo.findById).mockResolvedValue(mockTool)
    vi.mocked(mockPromptService.generate).mockResolvedValue({
      prompt: 'Optimized prompt text',
      model: 'claude-sonnet-4-5',
    })

    const useCase = new GeneratePromptUseCase(mockToolRepo, mockPromptService)
    const result = await useCase.execute({
      toolId: 'tool-1',
      userIntent: 'I want an email to request a refund professionally',
    })

    expect(result).toEqual({
      prompt: 'Optimized prompt text',
      model: 'claude-sonnet-4-5',
      toolName: 'ChatGPT',
      toolWebsite: 'https://chat.openai.com',
    })
    expect(mockPromptService.generate).toHaveBeenCalledWith({
      toolName: 'ChatGPT',
      toolSummary: 'AI assistant by OpenAI',
      userIntent: 'I want an email to request a refund professionally',
    })
  })

  it('throws ToolNotFoundException when tool does not exist', async () => {
    vi.mocked(mockToolRepo.findById).mockResolvedValue(null)

    const useCase = new GeneratePromptUseCase(mockToolRepo, mockPromptService)

    await expect(
      useCase.execute({ toolId: 'missing', userIntent: 'Write a haiku about coffee' }),
    ).rejects.toBeInstanceOf(ToolNotFoundException)
    expect(mockPromptService.generate).not.toHaveBeenCalled()
  })

  it('throws ToolNotPromptEnabledException when tool does not support prompts', async () => {
    vi.mocked(mockToolRepo.findById).mockResolvedValue({ ...mockTool, supports_prompt: false })

    const useCase = new GeneratePromptUseCase(mockToolRepo, mockPromptService)

    await expect(
      useCase.execute({ toolId: 'tool-1', userIntent: 'Write a haiku about coffee' }),
    ).rejects.toBeInstanceOf(ToolNotPromptEnabledException)
    expect(mockPromptService.generate).not.toHaveBeenCalled()
  })

  it('throws ValidationException when userIntent is too short', async () => {
    const useCase = new GeneratePromptUseCase(mockToolRepo, mockPromptService)

    await expect(
      useCase.execute({ toolId: 'tool-1', userIntent: 'short' }),
    ).rejects.toBeInstanceOf(ValidationException)
    expect(mockToolRepo.findById).not.toHaveBeenCalled()
  })

  it('throws ValidationException when userIntent exceeds 1000 chars', async () => {
    const useCase = new GeneratePromptUseCase(mockToolRepo, mockPromptService)

    await expect(
      useCase.execute({ toolId: 'tool-1', userIntent: 'a'.repeat(1001) }),
    ).rejects.toBeInstanceOf(ValidationException)
  })

  it('throws ValidationException when toolId is empty', async () => {
    const useCase = new GeneratePromptUseCase(mockToolRepo, mockPromptService)

    await expect(
      useCase.execute({ toolId: '', userIntent: 'Write a haiku about coffee' }),
    ).rejects.toBeInstanceOf(ValidationException)
  })
})
