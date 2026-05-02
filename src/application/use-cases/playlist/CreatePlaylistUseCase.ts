import type { IPlaylistRepository } from '@/application/ports/repositories'
import type { Tables, TablesInsert } from '@/shared/types/database.types'
import { PlaylistEntity } from '@/domain/entities/playlist.entity'


type Playlist = Tables<'playlists'>
type PlaylistInsert = TablesInsert<'playlists'>

export class CreatePlaylistUseCase {
  constructor(private playlistRepository: IPlaylistRepository) {}

  async execute(params: {
    name: string
    description?: string
    icon?: string
    color?: string
  }): Promise<Playlist> {
    // Validación con Domain Entity
    const entityData = PlaylistEntity.create({
      name: params.name,
      description: params.description,
      icon: params.icon,
      color: params.color,
    })

    // Mapeo camelCase → snake_case para Supabase
    const playlistData: PlaylistInsert = {
      name: entityData.name,
      description: entityData.description,
      icon: entityData.icon,
      color: entityData.color   
    }

    return this.playlistRepository.create(playlistData)
  }
}
