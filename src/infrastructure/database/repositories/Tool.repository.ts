import type { IToolRepository } from '@/application/ports/repositories'
import type { Tables, TablesInsert, TablesUpdate, Database } from '@/shared/types/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type Tool = Tables<'tools'>
type ToolInsert = TablesInsert<'tools'>
type ToolUpdate = TablesUpdate<'tools'>

export class ToolRepository implements IToolRepository {
  constructor(private client: SupabaseClient<Database>) {}

  async findAll(): Promise<Tool[]> {
    const { data, error } = await this.client
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findById(id: string): Promise<Tool | null> {
    const { data, error } = await this.client
      .from('tools')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  }

  async findByPlaylistId(playlistId: string): Promise<Tool[]> {
    const { data, error } = await this.client
      .from('tools')
      .select('*')
      .eq('playlist_id', playlistId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findByUserId(userId: string): Promise<Tool[]> {
    const { data, error } = await this.client
      .from('tools')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async findByPromptSupport(): Promise<Tool[]> {
    const { data, error } = await this.client
      .from('tools')
      .select('*')
      .eq('supports_prompt', true)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async search(query: string): Promise<Tool[]> {
    const escaped = query.replace(/[%_\\]/g, '\\$&')
    const { data, error } = await this.client
      .from('tools')
      .select('*')
      .ilike('name', `%${escaped}%`)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data || []
  }

  async create(data: ToolInsert): Promise<Tool> {
    const { data: tool, error } = await this.client
      .from('tools')
      .insert(data)
      .select()
      .single()
    if (error) throw error
    return tool
  }

  async update(id: string, data: ToolUpdate): Promise<Tool> {
    const { data: tool, error } = await this.client
      .from('tools')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return tool
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('tools')
      .delete()
      .eq('id', id)
    if (error) throw error
  }
}
