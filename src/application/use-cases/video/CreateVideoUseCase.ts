/**
 * Use Case: CreateVideoUseCase
 *
 * Crea un nuevo video en el sistema.
 * Si ya existe un video con el mismo platformVideoId, retorna el existente.
 */

import { VideoEntity, VideoPlatform } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'

export interface CreateVideoResult {
  video: VideoEntity
  created: boolean
}

export class CreateVideoUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  async execute(data: {
    title: string
    videoUrl: string
    platform: VideoPlatform
    platformVideoId: string
    playlistId?: string
    toolId?: string
    description?: string
    thumbnailUrl?: string
    tags?: string[]
    author?: string
    authorUrl?: string
    duration?: number
    viewCount?: number
    publishedAt?: string
  }): Promise<CreateVideoResult> {
    // Deduplicación: verificar si ya existe
    const existing = await this.videoRepository.findByPlatformVideoId(data.platformVideoId)
    if (existing) {
      return { video: existing, created: false }
    }

    // Validar y crear el video usando el método estático de la entidad
    const videoData = VideoEntity.create(data)

    // Persistir en la base de datos
    const video = await this.videoRepository.create(videoData)
    return { video, created: true }
  }
}
