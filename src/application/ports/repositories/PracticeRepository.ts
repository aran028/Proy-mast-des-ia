import type {Tables,TablesInsert,TablesUpdate} from '@/shared/types/database.types'

type Practice = Tables<'practices'>
type PracticeInsert = TablesInsert<'practices'>
type PracticeUpdate = TablesUpdate<'practices'>

export interface IPracticeRepository {
  findAll(): Promise<Practice[]>
  findById(id: string): Promise<Practice | null>
  findByPlaylistId(playlistId: string): Promise<Practice[]>
  findByToolId(toolId: string): Promise<Practice[]>
  create(data: PracticeInsert): Promise<Practice>
  update(id: string, data: PracticeUpdate): Promise<Practice>
  delete(id: string): Promise<void>
}
