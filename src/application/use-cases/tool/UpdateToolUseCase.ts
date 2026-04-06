import type { IToolRepository } from '@/application/ports/repositories'
import type { Tables, TablesUpdate } from '@/shared/types/database.types'
import { ToolNotFoundException } from '@/domain/exceptions'

type Tool = Tables<'tools'>
type ToolUpdate = TablesUpdate<'tools'>

export class UpdateToolUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(id: string, data: {
    name?: string
    summary?: string
    image?: string
    website?: string
    tags?: string[]
    playlistId?: string
  }): Promise<Tool> {
    const existing = await this.toolRepository.findById(id)
    if (!existing) throw new ToolNotFoundException(id)

    if (data.name !== undefined && data.name.length < 2) {
      throw new Error('Tool name must be at least 2 characters')
    }

    const updateData: ToolUpdate = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.website !== undefined && { website: data.website }),
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.playlistId !== undefined && { playlist_id: data.playlistId }),
      updated_at: new Date().toISOString(),
    }

    return this.toolRepository.update(id, updateData)
  }
}
