import type { IPracticeRepository } from '@/application/ports/repositories'
import type { Json, Tables, TablesUpdate } from '@/shared/types/database.types'
import { PracticeNotFoundException } from '@/domain/exceptions'
import type { PracticeType } from '@/domain/entities'

type Practice = Tables<'practices'>
type PracticeUpdate = TablesUpdate<'practices'>

export class UpdatePracticeUseCase {
  constructor(private readonly practiceRepository: IPracticeRepository) {}

  async execute(id: string, data: {
    title?: string
    description?: string
    content?: Json | null
    type?: PracticeType
    toolId?: string
    playlistId?: string
  }): Promise<Practice> {
    const existing = await this.practiceRepository.findById(id)
    if (!existing) throw new PracticeNotFoundException(id)

    if (data.title !== undefined && data.title.length < 3) {
      throw new Error('Practice title must be at least 3 characters')
    }

    const updateData: PracticeUpdate = {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.toolId !== undefined && { tool_id: data.toolId }),
      ...(data.playlistId !== undefined && { playlist_id: data.playlistId }),
    }

    return this.practiceRepository.update(id, updateData)
  }
}
