import type { IPlaylistRepository } from '@/application/ports/repositories'
import type { Tables, TablesUpdate } from '@/shared/types/database.types'
import { PlaylistNotFoundException } from '@/domain/exceptions'

type Playlist = Tables<'playlists'>
type PlaylistUpdate = TablesUpdate<'playlists'>

export class UpdatePlaylistUseCase {
  constructor(private playlistRepository: IPlaylistRepository) {}

  async execute(id: string, data: {
    name?: string
    description?: string
    icon?: string
    color?: string
  }): Promise<Playlist> {
    const existing = await this.playlistRepository.findById(id)
    if (!existing) throw new PlaylistNotFoundException(id)

    if (data.name !== undefined && data.name.length < 2) {
      throw new Error('Playlist name must be at least 2 characters')
    }

    const updateData: PlaylistUpdate = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.icon !== undefined && { icon: data.icon }),
      ...(data.color !== undefined && { color: data.color }),
      updated_at: new Date().toISOString(),
    }

    return this.playlistRepository.update(id, updateData)
  }
}
