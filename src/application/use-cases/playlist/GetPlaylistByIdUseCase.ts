import type { IPlaylistRepository } from '@/application/ports/repositories'
import type { Tables } from '@/shared/types/database.types'
import { PlaylistNotFoundException } from '@/domain/exceptions'

type Playlist = Tables<'playlists'>

export class GetPlaylistByIdUseCase {
  constructor(private playlistRepository: IPlaylistRepository) {}

  async execute(id: string): Promise<Playlist> {
    const playlist = await this.playlistRepository.findById(id)
    
    if (!playlist) {
      throw new PlaylistNotFoundException(id)
    }
    
    return playlist
  }
}
