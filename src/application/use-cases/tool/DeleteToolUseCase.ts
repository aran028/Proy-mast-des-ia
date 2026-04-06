import type { IToolRepository } from '@/application/ports/repositories'
import { ToolNotFoundException } from '@/domain/exceptions'

export class DeleteToolUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.toolRepository.findById(id)
    if (!existing) throw new ToolNotFoundException(id)

    return this.toolRepository.delete(id)
  }
}
