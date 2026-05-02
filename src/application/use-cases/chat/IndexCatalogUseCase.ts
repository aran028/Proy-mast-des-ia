import type {
  IPlaylistRepository,
  IToolRepository,
  IVectorRepository,
  VectorUpsertRow,
  VideoRepository,
} from '@/application/ports/repositories'
import type { IEmbeddingService } from '@/application/ports/services'
import type { VideoEntity } from '@/domain/entities/video.entity'
import type { Tables } from '@/shared/types/database.types'

export interface IndexCatalogResult {
  toolsIndexed: number
  playlistsIndexed: number
  videosIndexed: number
}

interface CatalogItem {
  sourceType: 'tool' | 'playlist' | 'video'
  sourceId: string
  text: string
  metadata: Record<string, unknown>
}

type ToolRow = Tables<'tools'>
type PlaylistRow = Tables<'playlists'>

export class IndexCatalogUseCase {
  constructor(
    private readonly toolRepository: IToolRepository,
    private readonly playlistRepository: IPlaylistRepository,
    private readonly videoRepository: VideoRepository,
    private readonly embeddingService: IEmbeddingService,
    private readonly vectorRepository: IVectorRepository,
  ) {}

  async execute(): Promise<IndexCatalogResult> {
    const [tools, playlists, videos] = await Promise.all([
      this.toolRepository.findAll(),
      this.playlistRepository.findAll(),
      this.videoRepository.findAll(),
    ])

    const playlistNameById = new Map(playlists.map((p) => [p.id, p.name]))
    const toolNameById = new Map(tools.map((t) => [t.id, t.name]))
    const toolsByPlaylistId = new Map<string, string[]>()
    for (const tool of tools) {
      if (!tool.playlist_id) continue
      const arr = toolsByPlaylistId.get(tool.playlist_id) ?? []
      arr.push(tool.name)
      toolsByPlaylistId.set(tool.playlist_id, arr)
    }

    const items: CatalogItem[] = [
      ...tools.map((t) => this.buildToolItem(t, playlistNameById)),
      ...playlists.map((p) => this.buildPlaylistItem(p, toolsByPlaylistId)),
      ...videos.map((v) =>
        this.buildVideoItem(v, playlistNameById, toolNameById),
      ),
    ]

    const nonEmpty = items.filter((item) => item.text.length > 0)
    if (nonEmpty.length === 0) {
      return { toolsIndexed: 0, playlistsIndexed: 0, videosIndexed: 0 }
    }

    const embeddings = await this.embeddingService.embedBatch(
      nonEmpty.map((item) => item.text),
    )

    await Promise.all(
      Array.from(new Set(nonEmpty.map((i) => i.sourceType))).map((type) =>
        this.deleteAllOfType(type, nonEmpty),
      ),
    )

    const rows: VectorUpsertRow[] = nonEmpty.map((item, idx) => ({
      sourceType: item.sourceType,
      sourceId: item.sourceId,
      documentId: null,
      chunkIndex: 0,
      content: item.text,
      embedding: embeddings[idx],
      metadata: item.metadata,
    }))

    await this.vectorRepository.upsert(rows)

    return {
      toolsIndexed: nonEmpty.filter((i) => i.sourceType === 'tool').length,
      playlistsIndexed: nonEmpty.filter((i) => i.sourceType === 'playlist').length,
      videosIndexed: nonEmpty.filter((i) => i.sourceType === 'video').length,
    }
  }

  private buildToolItem(
    tool: ToolRow,
    playlistNameById: Map<string, string>,
  ): CatalogItem {
    const playlistName = tool.playlist_id
      ? playlistNameById.get(tool.playlist_id)
      : undefined
    const lines = [`Herramienta: ${tool.name}`]
    if (playlistName) lines.push(`Playlist: ${playlistName}`)
    if (tool.summary?.trim()) lines.push(`Descripción: ${tool.summary.trim()}`)
    if (tool.website) lines.push(`Web: ${tool.website}`)
    if (tool.tags?.length) lines.push(`Tags: ${tool.tags.join(', ')}`)
    return {
      sourceType: 'tool',
      sourceId: tool.id,
      text: lines.join('\n'),
      metadata: {
        name: tool.name,
        playlist: playlistName ?? null,
        website: tool.website,
        supports_prompt: tool.supports_prompt,
      },
    }
  }

  private buildPlaylistItem(
    playlist: PlaylistRow,
    toolsByPlaylistId: Map<string, string[]>,
  ): CatalogItem {
    const lines = [`Playlist: ${playlist.name}`]
    const description = playlist.description?.trim() ?? ''
    if (description) lines.push(`Descripción: ${description}`)
    const playlistTools = toolsByPlaylistId.get(playlist.id)
    if (playlistTools?.length) {
      lines.push(`Herramientas: ${playlistTools.join(', ')}`)
    }
    return {
      sourceType: 'playlist',
      sourceId: playlist.id,
      text: lines.join('\n'),
      metadata: {
        name: playlist.name,
        tools: playlistTools ?? [],
      },
    }
  }

  private buildVideoItem(
    video: VideoEntity,
    playlistNameById: Map<string, string>,
    toolNameById: Map<string, string>,
  ): CatalogItem {
    const videoPlaylist = video.playlistId
      ? playlistNameById.get(video.playlistId)
      : undefined
    const videoTool = video.toolId ? toolNameById.get(video.toolId) : undefined
    const lines = [`Video: ${video.title}`]
    if (videoPlaylist) lines.push(`Playlist: ${videoPlaylist}`)
    if (videoTool) lines.push(`Herramienta: ${videoTool}`)
    if (video.description?.trim())
      lines.push(`Descripción: ${video.description.trim()}`)
    if (video.author) lines.push(`Autor: ${video.author}`)
    if (video.authorUrl) lines.push(`URL del autor: ${video.authorUrl}`)
    if (video.videoUrl) lines.push(`Web: ${video.videoUrl}`)
    if (video.tags?.length) lines.push(`Tags: ${video.tags.join(', ')}`)
    return {
      sourceType: 'video',
      sourceId: video.id,
      text: lines.join('\n'),
      metadata: {
        title: video.title,
        playlist: videoPlaylist ?? null,
        tool: videoTool ?? null,
        author: video.author,
        authorUrl: video.authorUrl,
        platform: video.platform,
        videoUrl: video.videoUrl,
      },
    }
  }

  private async deleteAllOfType(
    type: 'tool' | 'playlist' | 'video',
    items: CatalogItem[],
  ): Promise<void> {
    const ids = items.filter((i) => i.sourceType === type).map((i) => i.sourceId)
    await Promise.all(
      ids.map((id) => this.vectorRepository.deleteBySource(type, id)),
    )
  }
}
