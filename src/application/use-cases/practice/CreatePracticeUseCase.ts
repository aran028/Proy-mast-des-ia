import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Tables, TablesInsert } from '@/shared/types/database.types'
import { PracticeEntity, type PracticeType } from '@/domain/entities'

type Practice = Tables<'practices'>
type PracticeInsert = TablesInsert<'practices'>

export class CreatePracticeUseCase {
  constructor(private practiceRepository: IPracticeRepository) {}

  async execute(params: {
    title: string
    description?: string
    type?: PracticeType
    playlistId?: string
    toolId?: string
    userId?: string
  }): Promise<Practice> {
    const entityData = PracticeEntity.create({
      title: params.title,
      description: params.description,
      type: params.type,
      playlistId: params.playlistId,
      toolId: params.toolId,
    })

    const practiceData: PracticeInsert = {
      title: entityData.title,
      description: entityData.description,
      content: entityData.content,
      type: entityData.type,
      playlist_id: params.playlistId || null,
      tool_id: params.toolId || null,
      user_id: params.userId || null,
    }

    return this.practiceRepository.create(practiceData)
  }
}
