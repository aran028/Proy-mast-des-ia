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
    website?: string
    playlistId?: string
    supportsPrompt?: boolean
  }): { playlistId: string | null; userId: null; name: string; summary: string | null; image: null; tags: null; website: string | null; supportsPrompt: boolean } {
    if (!data.name || data.name.length < 2) {
      throw new Error('Tool name must be at least 2 characters')
    }
    return {
      playlistId: data.playlistId || null,
      userId: null,
      name: data.name,
      summary: data.summary || null,
      image: null,
      tags: null,
      website: data.website || null,
      supportsPrompt: data.supportsPrompt ?? false,
    }
  }

  getTags(): string[] {
    return this.tags || []
  }
}
