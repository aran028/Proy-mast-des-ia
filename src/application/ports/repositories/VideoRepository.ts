// src/application/ports/repositories/video.repository.ts
import type { TablesInsert, TablesUpdate } from '@/shared/types/database.types'
import { VideoEntity } from '@/domain/entities/video.entity'

type VideoInsert = TablesInsert<'videos'>
type VideoUpdate = TablesUpdate<'videos'>

export interface VideoRepository {
  findAll(): Promise<VideoEntity[]>
  findById(id: string): Promise<VideoEntity | null>
  findByPlaylistId(playlistId: string): Promise<VideoEntity[]>
  findByToolId(toolId: string): Promise<VideoEntity[]>
  findByPlatform(platform: string): Promise<VideoEntity[]>
  findByPlatformVideoId(platformVideoId: string): Promise<VideoEntity | null>
  create(data: VideoInsert): Promise<VideoEntity>
  update(id: string, data: VideoUpdate): Promise<VideoEntity>
  delete(id: string): Promise<void>
}
