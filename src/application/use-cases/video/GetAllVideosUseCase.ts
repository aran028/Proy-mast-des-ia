/**
 * Use Case: GetAllVideosUseCase
 * 
 * Obtiene todos los videos aprobados del sistema.
 */

import { VideoEntity } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'

export class GetAllVideosUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  async execute(): Promise<VideoEntity[]> {
    return this.videoRepository.findAll()
  }
}
