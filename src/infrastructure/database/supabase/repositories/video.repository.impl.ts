/**
 * Implementación: SupabaseVideoRepository
 * 
 * Implementación concreta del VideoRepository usando Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { VideoEntity, VideoPlatform, VideoStatus } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'
import { Database } from '@/shared/types/database.types'

export class SupabaseVideoRepository implements VideoRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}

  async findAll(): Promise<VideoEntity[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(this.mapToEntity)
  }

  async findById(id: string): Promise<VideoEntity | null> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return this.mapToEntity(data)
  }

  async findByPlaylistId(playlistId: string): Promise<VideoEntity[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('playlist_id', playlistId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(this.mapToEntity)
  }

  async findByToolId(toolId: string): Promise<VideoEntity[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('tool_id', toolId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(this.mapToEntity)
  }

  async findByPlatform(platform: string): Promise<VideoEntity[]> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('platform', platform)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data.map(this.mapToEntity)
  }

  async findByPlatformVideoId(platformVideoId: string): Promise<VideoEntity | null> {
    const { data, error } = await this.client
      .from('videos')
      .select('*')
      .eq('platform_video_id', platformVideoId)
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data ? this.mapToEntity(data) : null
  }

  async create(data: Omit<VideoEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<VideoEntity> {
    const { data: created, error } = await this.client
      .from('videos')
      .insert({
        playlist_id: data.playlistId,
        tool_id: data.toolId,
        title: data.title,
        description: data.description,
        thumbnail_url: data.thumbnailUrl,
        video_url: data.videoUrl,
        platform: data.platform,
        platform_video_id: data.platformVideoId,
        author: data.author,
        author_url: data.authorUrl,
        duration: data.duration,
        view_count: data.viewCount,
        published_at: data.publishedAt,
        tags: data.tags,
        ai_classified: data.aiClassified,
        classification_confidence: data.classificationConfidence,
        status: data.status,
      })
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(created)
  }

  async update(id: string, data: Partial<VideoEntity>): Promise<VideoEntity> {
    const updateData: any = {}

    if (data.playlistId !== undefined) updateData.playlist_id = data.playlistId
    if (data.toolId !== undefined) updateData.tool_id = data.toolId
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.thumbnailUrl !== undefined) updateData.thumbnail_url = data.thumbnailUrl
    if (data.videoUrl !== undefined) updateData.video_url = data.videoUrl
    if (data.platform !== undefined) updateData.platform = data.platform
    if (data.platformVideoId !== undefined) updateData.platform_video_id = data.platformVideoId
    if (data.author !== undefined) updateData.author = data.author
    if (data.authorUrl !== undefined) updateData.author_url = data.authorUrl
    if (data.duration !== undefined) updateData.duration = data.duration
    if (data.viewCount !== undefined) updateData.view_count = data.viewCount
    if (data.publishedAt !== undefined) updateData.published_at = data.publishedAt
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.aiClassified !== undefined) updateData.ai_classified = data.aiClassified
    if (data.classificationConfidence !== undefined) {
      updateData.classification_confidence = data.classificationConfidence
    }
    if (data.status !== undefined) updateData.status = data.status

    const { data: updated, error } = await this.client
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(updated)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from('videos')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  /**
   * Mapea una fila de la base de datos a una entidad VideoEntity
   */
  private mapToEntity(row: any): VideoEntity {
    return new VideoEntity({
      id: row.id,
      playlistId: row.playlist_id,
      toolId: row.tool_id,
      title: row.title,
      description: row.description,
      thumbnailUrl: row.thumbnail_url,
      videoUrl: row.video_url,
      platform: row.platform as VideoPlatform,
      platformVideoId: row.platform_video_id,
      author: row.author,
      authorUrl: row.author_url,
      duration: row.duration,
      viewCount: row.view_count,
      publishedAt: row.published_at,
      tags: row.tags,
      aiClassified: row.ai_classified,
      classificationConfidence: row.classification_confidence 
        ? Number(row.classification_confidence) 
        : null,
      status: row.status as VideoStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })
  }
}
