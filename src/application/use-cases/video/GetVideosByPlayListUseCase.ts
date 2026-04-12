/**
 * Use Case: GetVideosByPlaylistUseCase
 * 
 * Obtiene todos los videos aprobados de una playlist específica.
 */

import { VideoEntity } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'

export class GetVideosByPlaylistUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  async execute(playlistId: string): Promise<VideoEntity[]> {
    if (!playlistId) {
      throw new Error('Playlist ID is required')
    }
    
    return this.videoRepository.findByPlaylistId(playlistId)
  }
}
