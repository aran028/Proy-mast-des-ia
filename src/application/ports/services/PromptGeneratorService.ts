export interface PromptGenerationInput {
  toolName: string
  toolSummary: string | null
  userIntent: string
}

export interface PromptGenerationResult {
  prompt: string
  model: string
}

export interface IPromptGeneratorService {
  generate(input: PromptGenerationInput): Promise<PromptGenerationResult>
}
