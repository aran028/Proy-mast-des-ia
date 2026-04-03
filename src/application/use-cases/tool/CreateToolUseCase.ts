import type { IToolRepository } from '@/application/ports/repositories'
import type { Tool, ToolInsert } from '@/shared/types/database.types'
import { ToolEntity } from '@/domain/entities'

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
      ...entityData,
      userId: params.userId || null,
    }

    return this.toolRepository.create(toolData)
  }
}
