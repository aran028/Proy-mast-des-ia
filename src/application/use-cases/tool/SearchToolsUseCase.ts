import type { IToolRepository } from '@/application/ports/repositories'
import type { Tool } from '@/shared/types/database.types'

export class SearchToolsUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(query: string): Promise<Tool[]> {
    if (!query || query.length < 2) {
      return []
    }
    return this.toolRepository.search(query)
  }
}
