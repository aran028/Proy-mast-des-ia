import { z } from 'zod'
import type { IToolRepository } from '@/application/ports/repositories'
import type { IPromptGeneratorService } from '@/application/ports/services'
import {
  ToolNotFoundException,
  ToolNotPromptEnabledException,
  ValidationException,
} from '@/domain/exceptions'

const inputSchema = z.object({
  toolId: z.string().min(1, 'toolId is required'),
  userIntent: z
    .string()
    .min(10, 'Intent must be at least 10 characters')
    .max(1000, 'Intent must be at most 1000 characters'),
})

export type GeneratePromptInput = z.infer<typeof inputSchema>

export interface GeneratePromptResult {
  prompt: string
  model: string
  toolName: string
  toolWebsite: string | null
}

export class GeneratePromptUseCase {
  constructor(
    private readonly toolRepository: IToolRepository,
    private readonly promptGenerator: IPromptGeneratorService,
  ) {}

  async execute(input: GeneratePromptInput): Promise<GeneratePromptResult> {
    const parsed = inputSchema.safeParse(input)
    if (!parsed.success) {
      throw new ValidationException(parsed.error.issues[0]?.message ?? 'Invalid input')
    }

    const tool = await this.toolRepository.findById(parsed.data.toolId)
    if (!tool) throw new ToolNotFoundException(parsed.data.toolId)

    if (!tool.supports_prompt) {
      throw new ToolNotPromptEnabledException(tool.id)
    }

    const result = await this.promptGenerator.generate({
      toolName: tool.name,
      toolSummary: tool.summary,
      userIntent: parsed.data.userIntent,
    })

    return {
      prompt: result.prompt,
      model: result.model,
      toolName: tool.name,
      toolWebsite: tool.website,
    }
  }
}
