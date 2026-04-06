import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Practice = Tables<'practices'>

export class GetPracticesByToolUseCase {
  constructor(private practiceRepository: IPracticeRepository) {}

  async execute(toolId: string): Promise<Practice[]> {
    return this.practiceRepository.findByToolId(toolId)
  }
}
