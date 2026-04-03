import type { IPlaylistRepository } from '@/application/ports/repositories'
import type { Playlist } from '@/shared/types/database.types'

export class GetAllPlaylistsUseCase {
  constructor(private playlistRepository: IPlaylistRepository) {}

  async execute(): Promise<Playlist[]> {
    return this.playlistRepository.findAll()
  }
}
