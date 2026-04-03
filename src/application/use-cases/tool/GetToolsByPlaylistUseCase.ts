import type { IToolRepository } from '@/application/ports/repositories'
import type { Tool } from '@/shared/types/database.types'

export class GetToolsByPlaylistUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(playlistId: string): Promise<Tool[]> {
    return this.toolRepository.findByPlaylistId(playlistId)
  }
}
