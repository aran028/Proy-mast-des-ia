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
    const validated = VideoEntity.create(data)

    // Persistir en la base de datos (mapear a snake_case para Supabase)
    const video = await this.videoRepository.create({
      playlist_id: validated.playlistId,
      tool_id: validated.toolId,
      title: validated.title,
      description: validated.description,
      thumbnail_url: validated.thumbnailUrl,
      video_url: validated.videoUrl,
      platform: validated.platform,
      platform_video_id: validated.platformVideoId,
      author: validated.author,
      author_url: validated.authorUrl,
      duration: validated.duration,
      view_count: validated.viewCount,
      published_at: validated.publishedAt,
      tags: validated.tags,
      ai_classified: validated.aiClassified,
      classification_confidence: validated.classificationConfidence,
      status: validated.status,
    })
    return { video, created: true }
  }
}
