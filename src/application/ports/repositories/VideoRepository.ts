// src/application/ports/repositories/video.repository.ts
import { VideoEntity } from '@/domain/entities/video.entity'

export interface VideoRepository {
  findAll(): Promise<VideoEntity[]>
  findById(id: string): Promise<VideoEntity | null>
  findByPlaylistId(playlistId: string): Promise<VideoEntity[]>
  findByToolId(toolId: string): Promise<VideoEntity[]>
  findByPlatform(platform: string): Promise<VideoEntity[]>
  findByPlatformVideoId(platformVideoId: string): Promise<VideoEntity | null>
  create(data: Omit<VideoEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoEntity>
  update(id: string, data: Partial<VideoEntity>): Promise<VideoEntity>
  delete(id: string): Promise<void>
}
