import type { Tables, TablesInsert, TablesUpdate } from '@/shared/types/database.types'

type Tool = Tables<'tools'>
type ToolInsert = TablesInsert<'tools'>
type ToolUpdate = TablesUpdate<'tools'>


export interface IToolRepository {
  findAll(): Promise<Tool[]>
  findById(id: string): Promise<Tool | null>
  findByPlaylistId(playlistId: string): Promise<Tool[]>
  findByUserId(userId: string): Promise<Tool[]>
  search(query: string): Promise<Tool[]>
  create(data: ToolInsert): Promise<Tool>
  update(id: string, data: ToolUpdate): Promise<Tool>
  delete(id: string): Promise<void>
}
