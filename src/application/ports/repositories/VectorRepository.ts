import type { RetrievedChunk, RetrievedChunkSource } from '@/domain/value-objects'

export interface VectorUpsertRow {
  sourceType: RetrievedChunkSource
  sourceId: string | null
  documentId: string | null
  chunkIndex: number
  content: string
  embedding: number[]
  metadata?: Record<string, unknown>
}

export interface IVectorRepository {
  search(
    embedding: number[],
    threshold: number,
    count: number,
  ): Promise<RetrievedChunk[]>
  upsert(rows: VectorUpsertRow[]): Promise<void>
  deleteBySource(
    sourceType: RetrievedChunkSource,
    sourceId: string,
  ): Promise<void>
  deleteByDocument(documentId: string): Promise<void>
}
