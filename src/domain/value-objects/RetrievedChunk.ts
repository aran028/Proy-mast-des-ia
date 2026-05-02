export type RetrievedChunkSource = 'tool' | 'playlist' | 'video' | 'document'

export interface RetrievedChunkProps {
  id: string
  sourceType: RetrievedChunkSource
  sourceId: string | null
  documentId: string | null
  content: string
  similarity: number
  metadata: Record<string, unknown>
}

export class RetrievedChunk {
  private constructor(private readonly props: RetrievedChunkProps) {}

  static create(props: RetrievedChunkProps): RetrievedChunk {
    if (!props.id) throw new Error('RetrievedChunk requires id')
    if (!props.content?.trim()) throw new Error('RetrievedChunk requires content')
    if (props.similarity < 0 || props.similarity > 1) {
      throw new Error('Similarity must be between 0 and 1')
    }
    return new RetrievedChunk({ ...props, content: props.content.trim() })
  }

  getId(): string {
    return this.props.id
  }

  getSourceType(): RetrievedChunkSource {
    return this.props.sourceType
  }

  getSourceId(): string | null {
    return this.props.sourceId
  }

  getDocumentId(): string | null {
    return this.props.documentId
  }

  getContent(): string {
    return this.props.content
  }

  getSimilarity(): number {
    return this.props.similarity
  }

  getMetadata(): Record<string, unknown> {
    return this.props.metadata
  }
}
