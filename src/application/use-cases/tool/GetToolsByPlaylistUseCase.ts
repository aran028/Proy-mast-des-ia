import type { IToolRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

export class GetToolsByPlaylistUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(playlistId: string): Promise<Tool[]> {
    return this.toolRepository.findByPlaylistId(playlistId)
  }
}
