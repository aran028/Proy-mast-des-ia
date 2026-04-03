import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Practice } from '@/shared/types/database.types'

export class GetPracticesByPlaylistUseCase {
  constructor(private practiceRepository: IPracticeRepository) {}

  async execute(playlistId: string): Promise<Practice[]> {
    return this.practiceRepository.findByPlaylistId(playlistId)
  }
}
