import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Tables, TablesInsert, TablesUpdate, Database } from '@/shared/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Practice = Tables<'practices'>
type PracticeInsert = TablesInsert<'practices'>
type PracticeUpdate = TablesUpdate<'practices'>

export class PracticeRepository implements IPracticeRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async findAll(): Promise<Practice[]> {
    const { data, error } = await this.client
      .from('practices')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<Practice | null> {
    const { data, error } = await this.client
      .from('practices')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  }

  async findByPlaylistId(playlistId: string): Promise<Practice[]> {
    const { data, error } = await this.client
      .from('practices')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findByToolId(toolId: string): Promise<Practice[]> {
    const { data, error } = await this.client
      .from('practices')
      .select('*')
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(data: PracticeInsert): Promise<Practice> {
    const { data: practice, error } = await this.client
      .from('practices')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return practice
  }

  async update(id: string, data: PracticeUpdate): Promise<Practice> {
    const { data: practice, error } = await this.client
      .from('practices')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return practice
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('practices')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
