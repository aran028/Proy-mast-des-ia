import type { IToolRepository } from '@/application/ports/repositories'
import type { Tables, TablesInsert } from '@/shared/types/database.types'
import { ToolEntity } from '@/domain/entities'

type Tool = Tables<'tools'>
type ToolInsert = TablesInsert<'tools'>

export class CreateToolUseCase {
  constructor(private toolRepository: IToolRepository) {}

  async execute(params: {
    name: string
    summary?: string
    website?: string
    playlistId?: string
    userId?: string
  }): Promise<Tool> {
    const entityData = ToolEntity.create({
      name: params.name,
      summary: params.summary,
      website: params.website,
      playlistId: params.playlistId,
    })

    const toolData: ToolInsert = {
      name: entityData.name,
      summary: entityData.summary,
      image: entityData.image,
      tags: entityData.tags,
      website: entityData.website,
      playlist_id: params.playlistId || null,
      user_id: params.userId || null,
    }

    return this.toolRepository.create(toolData)
  }
}
