/**
 * Entidad: Video
 * 
 * Representa un video de YouTube, Instagram o TikTok clasificado
 * automáticamente por IA y asociado a playlists y tools.
 */

export type VideoPlatform = 'youtube' | 'instagram' | 'tiktok'
export type VideoStatus = 'pending' | 'approved' | 'rejected'

export class VideoEntity {
  readonly id: string
  readonly playlistId: string | null
  readonly toolId: string | null
  title: string
  description: string | null
  thumbnailUrl: string | null
  videoUrl: string
  platform: VideoPlatform
  platformVideoId: string
  author: string | null
  authorUrl: string | null
  duration: number | null // segundos
  viewCount: number | null
  publishedAt: string | null
  tags: string[] | null
  aiClassified: boolean
  classificationConfidence: number | null
  status: VideoStatus
  readonly createdAt: string
  updatedAt: string | null

  constructor(data: {
    id: string
    playlistId: string | null
    toolId: string | null
    title: string
    description: string | null
    thumbnailUrl: string | null
    videoUrl: string
    platform: VideoPlatform
    platformVideoId: string
    author: string | null
    authorUrl: string | null
    duration: number | null
    viewCount: number | null
    publishedAt: string | null
    tags: string[] | null
    aiClassified: boolean
    classificationConfidence: number | null
    status: VideoStatus
    createdAt: string
    updatedAt: string | null
  }) {
    this.id = data.id
    this.playlistId = data.playlistId
    this.toolId = data.toolId
    this.title = data.title
    this.description = data.description
    this.thumbnailUrl = data.thumbnailUrl
    this.videoUrl = data.videoUrl
    this.platform = data.platform
    this.platformVideoId = data.platformVideoId
    this.author = data.author
    this.authorUrl = data.authorUrl
    this.duration = data.duration
    this.viewCount = data.viewCount
    this.publishedAt = data.publishedAt
    this.tags = data.tags
    this.aiClassified = data.aiClassified
    this.classificationConfidence = data.classificationConfidence
    this.status = data.status
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  /**
   * Crea un nuevo video con validación
   * @param data - Datos del video
   * @returns Objeto con datos validados para crear el video
   * @throws Error si los datos no son válidos
   */
  static create(data: {
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
  }): {
    playlistId: string | null
    toolId: string | null
    title: string
    description: string | null
    thumbnailUrl: string | null
    videoUrl: string
    platform: VideoPlatform
    platformVideoId: string
    author: string | null
    authorUrl: string | null
    duration: number | null
    viewCount: number | null
    publishedAt: string | null
    tags: string[] | null
    aiClassified: boolean
    classificationConfidence: number | null
    status: VideoStatus
  } {
    if (!data.title || data.title.length < 3) {
      throw new Error('Video title must be at least 3 characters')
    }

    if (!data.videoUrl) {
      throw new Error('Video URL is required')
    }

    if (!data.platformVideoId) {
      throw new Error('Platform video ID is required')
    }

    return {
      playlistId: data.playlistId || null,
      toolId: data.toolId || null,
      title: data.title,
      description: data.description || null,
      thumbnailUrl: data.thumbnailUrl || null,
      videoUrl: data.videoUrl,
      platform: data.platform,
      platformVideoId: data.platformVideoId,
      author: data.author || null,
      authorUrl: data.authorUrl || null,
      duration: data.duration ?? null,
      viewCount: data.viewCount ?? null,
      publishedAt: data.publishedAt || null,
      tags: data.tags || null,
      aiClassified: false,
      classificationConfidence: null,
      status: 'approved',
    }
  }

  /**
   * Aprueba el video para mostrarlo públicamente
   */
  approve(): void {
    this.status = 'approved'
  }

  /**
   * Rechaza el video
   */
  reject(): void {
    this.status = 'rejected'
  }

  /**
   * Obtiene los tags del video
   * @returns Array de tags (vacío si no tiene)
   */
  getTags(): string[] {
    return this.tags || []
  }

  /**
   * Verifica si el video está aprobado
   * @returns true si está aprobado
   */
  isApproved(): boolean {
    return this.status === 'approved'
  }

  /**
   * Verifica si el video fue clasificado por IA
   * @returns true si fue clasificado por IA
   */
  isAiClassified(): boolean {
    return this.aiClassified
  }

  /**
   * Formatea la duración en formato mm:ss
   * @returns String con formato mm:ss o null
   */
  getFormattedDuration(): string | null {
    if (!this.duration) return null
    const mins = Math.floor(this.duration / 60)
    const secs = this.duration % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }
}
