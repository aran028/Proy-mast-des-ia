/**
 * Implementación: SupabaseVideoRepository
 * 
 * Implementación concreta del VideoRepository usando Supabase.
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { VideoEntity, VideoPlatform, VideoStatus } from '@/domain/entities/video.entity'
import { VideoRepository } from '@/application/ports/repositories/VideoRepository'
import { Database, TablesInsert, TablesUpdate } from '@/shared/types/database.types'

type VideoRow = Database['public']['Tables']['videos']['Row']

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

  async create(data: TablesInsert<'videos'>): Promise<VideoEntity> {
    const { data: created, error } = await this.client
      .from('videos')
      .insert(data)
      .select()
      .single()

    if (error) throw error
    return this.mapToEntity(created)
  }

  async update(id: string, data: TablesUpdate<'videos'>): Promise<VideoEntity> {
    const { data: updated, error } = await this.client
      .from('videos')
      .update(data)
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
  private mapToEntity(row: VideoRow): VideoEntity {
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
      aiClassified: row.ai_classified ?? false,
      classificationConfidence: row.classification_confidence
        ? Number(row.classification_confidence)
        : null,
      status: (row.status as VideoStatus) ?? 'pending',
      createdAt: row.created_at ?? new Date().toISOString(),
      updatedAt: row.updated_at,
    })
  }
}
