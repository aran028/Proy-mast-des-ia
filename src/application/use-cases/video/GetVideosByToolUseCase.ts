/**
 * Use Case: GetVideosByToolUseCase
 * 
 * Obtiene todos los videos aprobados de una tool específica.
 */

import { VideoEntity } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'

export class GetVideosByToolUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  async execute(toolId: string): Promise<VideoEntity[]> {
    if (!toolId) {
      throw new Error('Tool ID is required')
    }
    
    return this.videoRepository.findByToolId(toolId)
  }
}
