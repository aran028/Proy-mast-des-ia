import type { IPlaylistRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>

export class GetAllPlaylistsUseCase {
  constructor(private playlistRepository: IPlaylistRepository) {}

  async execute(): Promise<Playlist[]> {
    return this.playlistRepository.findAll()
  }
}
