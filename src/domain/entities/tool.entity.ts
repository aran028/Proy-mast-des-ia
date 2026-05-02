export class ToolEntity {
  readonly id: string
  readonly playlistId: string | null
  readonly userId: string | null
  name: string
  summary: string | null
  image: string | null
  tags: string[] | null
  website: string | null
  supportsPrompt: boolean
  readonly createdAt: string
  updatedAt: string | null

  constructor(data: {
    id: string
    playlistId: string | null
    userId: string | null
    name: string
    summary: string | null
    image: string | null
    tags: string[] | null
    website: string | null
    supportsPrompt: boolean
    createdAt: string
    updatedAt: string | null
  }) {
    this.id = data.id
    this.playlistId = data.playlistId
    this.userId = data.userId
    this.name = data.name
    this.summary = data.summary
    this.image = data.image
    this.tags = data.tags
    this.website = data.website
    this.supportsPrompt = data.supportsPrompt
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static create(data: {
    name: string
    summary?: string
    image?: string | null
    tags?: string[] | null
    website?: string
    playlistId?: string
    supportsPrompt?: boolean
  }): { playlistId: string | null; userId: null; name: string; summary: string | null; image: string | null; tags: string[] | null; website: string | null; supportsPrompt: boolean } {
    if (!data.name || data.name.length < 2) {
      throw new Error('Tool name must be at least 2 characters')
    }

    const normalizedTags = data.tags?.map(tag => tag.trim()).filter(Boolean) ?? null

    return {
      playlistId: data.playlistId || null,
      userId: null,
      name: data.name,
      summary: data.summary || null,
      image: data.image?.trim() || null,
      tags: normalizedTags && normalizedTags.length > 0 ? normalizedTags : null,
      website: ToolEntity.normalizeWebsite(data.website),
      supportsPrompt: data.supportsPrompt ?? false,
    }
  }

  // Solo permite http(s). Bloquea javascript:, data:, vbscript:, file:, etc.
  // Devuelve null si la URL es vacía/null; lanza si no es válida o usa otro esquema.
  static normalizeWebsite(url: string | null | undefined): string | null {
    if (url == null) return null
    const trimmed = url.trim()
    if (!trimmed) return null

    let parsed: URL
    try {
      parsed = new URL(trimmed)
    } catch {
      throw new Error('Tool website must be a valid URL')
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      throw new Error('Tool website must use http or https')
    }

    // Devolvemos el string original (trimmed) para no canonicalizar (la URL
    // canónica añade trailing slash al host raíz y eso modificaría datos en BD).
    return trimmed
  }

  getTags(): string[] {
    return this.tags || []
  }
}
