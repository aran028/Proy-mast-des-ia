import type { Tables, TablesInsert,TablesUpdate} from '@/shared/types/database.types'

// Tipos específicos de Supabase
type Playlist = Tables<'playlists'>
type PlaylistInsert = TablesInsert<'playlists'>
type PlaylistUpdate = TablesUpdate<'playlists'>

export interface IPlaylistRepository {
  findAll(): Promise<Playlist[]>
  findById(id: string): Promise<Playlist | null>
  findByUserId(userId: string): Promise<Playlist[]>
  create(data: PlaylistInsert): Promise<Playlist>
  update(id: string, data: PlaylistUpdate): Promise<Playlist>
  delete(id: string): Promise<void>
}
