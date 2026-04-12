/**
 * Use Case: UpdateVideoUseCase
 * 
 * Actualiza un video existente (usado principalmente por admins).
 */

import { VideoEntity } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'
import type { TablesUpdate } from '@/shared/types/database.types'

export class UpdateVideoUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  async execute(id: string, data: TablesUpdate<'videos'>): Promise<VideoEntity> {
    if (!id) {
      throw new Error('Video ID is required')
    }

    // Verificar que el video existe
    const existingVideo = await this.videoRepository.findById(id)
    if (!existingVideo) {
      throw new Error('Video not found')
    }

    // Actualizar
    return this.videoRepository.update(id, data)
  }
}
