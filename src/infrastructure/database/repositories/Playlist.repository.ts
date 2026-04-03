import type { IPlaylistRepository } from '@/application/ports/repositories'
import type { Tables, TablesInsert, TablesUpdate } from '@/shared/types/database.types'
import { createServerClient } from '../supabase/server'


type Playlist = Tables<'playlists'>
type PlaylistInsert = TablesInsert<'playlists'>
type PlaylistUpdate = TablesUpdate<'playlists'>


export class PlaylistRepository implements IPlaylistRepository {
  private client = createServerClient()

  async findAll(): Promise<Playlist[]> {
    const { data, error } = await this.client
      .from('playlists')
      .select('*')
      .order('order_num', { ascending: true })
    
    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<Playlist | null> {
    const { data, error } = await this.client
      .from('playlists')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) return null
    return data
  }

  async findByUserId(userId: string): Promise<Playlist[]> {
    const { data, error } = await this.client
      .from('playlists')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data || []
  }

  async create(data: PlaylistInsert): Promise<Playlist> {
    const { data: playlist, error } = await this.client
      .from('playlists')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return playlist
  }

  async update(id: string, data: PlaylistUpdate): Promise<Playlist> {
    const { data: playlist, error } = await this.client
      .from('playlists')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return playlist
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('playlists')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}
