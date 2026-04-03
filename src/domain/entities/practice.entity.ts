export type PracticeType = 'rag' | 'automation' | 'extraction' | 'tutorial'

export class PracticeEntity {
  readonly id: string
  readonly playlistId: string | null
  readonly toolId: string | null
  readonly userId: string | null
  title: string
  description: string | null
  content: Record<string, unknown> | null
  type: PracticeType | null
  readonly createdAt: string
  updatedAt: string | null

  constructor(data: {
    id: string
    playlistId: string | null
    toolId: string | null
    userId: string | null
    title: string
    description: string | null
    content: Record<string, unknown> | null
    type: PracticeType | null
    createdAt: string
    updatedAt: string | null
  }) {
    this.id = data.id
    this.playlistId = data.playlistId
    this.toolId = data.toolId
    this.userId = data.userId
    this.title = data.title
    this.description = data.description
    this.content = data.content
    this.type = data.type
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static create(data: {
    title: string
    description?: string
    type?: PracticeType
    playlistId?: string
    toolId?: string
  }): { playlistId: string | null; toolId: string | null; userId: null; title: string; description: string | null; content: null; type: PracticeType | null } {
    if (!data.title || data.title.length < 3) {
      throw new Error('Practice title must be at least 3 characters')
    }
    return {
      playlistId: data.playlistId || null,
      toolId: data.toolId || null,
      userId: null,
      title: data.title,
      description: data.description || null,
      content: null,
      type: data.type || null,
    }
  }

  isType(type: PracticeType): boolean {
    return this.type === type
  }
}
