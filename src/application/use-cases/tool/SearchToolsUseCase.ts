import type { IToolRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

export class SearchToolsUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(query: string): Promise<Tool[]> {
    if (!query || query.length < 2) {
      return []
    }
    return this.toolRepository.search(query)
  }
}
