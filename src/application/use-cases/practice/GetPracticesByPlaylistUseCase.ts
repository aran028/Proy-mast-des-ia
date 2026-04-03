import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Practice = Tables<'practices'>

export class GetPracticesByPlaylistUseCase {
  constructor(private practiceRepository: IPracticeRepository) {}

  async execute(playlistId: string): Promise<Practice[]> {
    return this.practiceRepository.findByPlaylistId(playlistId)
  }
}
