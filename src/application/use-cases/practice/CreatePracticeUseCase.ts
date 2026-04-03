import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Practice, PracticeInsert } from '@/shared/types/database.types'
import { PracticeEntity, type PracticeType } from '@/domain/entities'

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
      ...entityData,
      userId: params.userId || null,
    }

    return this.practiceRepository.create(practiceData)
  }
}
