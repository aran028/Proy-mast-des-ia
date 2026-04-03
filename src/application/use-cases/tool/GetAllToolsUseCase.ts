import type { IToolRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

export class GetAllToolsUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(): Promise<Tool[]> {
    return this.toolRepository.findAll()
  }
}
