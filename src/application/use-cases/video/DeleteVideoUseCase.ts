/**
 * Use Case: DeleteVideoUseCase
 * 
 * Elimina un video del sistema (solo admins).
 */

import { VideoRepository } from '@/application/ports/repositories/VideoRepository'

export class DeleteVideoUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  async execute(id: string): Promise<void> {
    if (!id) {
      throw new Error('Video ID is required')
    }

    // Verificar que el video existe
    const existingVideo = await this.videoRepository.findById(id)
    if (!existingVideo) {
      throw new Error('Video not found')
    }

    // Eliminar
    await this.videoRepository.delete(id)
  }
}
