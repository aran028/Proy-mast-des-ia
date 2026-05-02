import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  IVectorRepository,
  VectorUpsertRow,
} from '@/application/ports/repositories'
import {
  RetrievedChunk,
  type RetrievedChunkSource,
} from '@/domain/value-objects'
import { RetrievalFailedException } from '@/domain/exceptions'

interface MatchDocumentsRow {
  id: string
  source_type: string
  source_id: string | null
  document_id: string | null
  content: string
  metadata: Record<string, unknown> | null
  similarity: number
}

// pgvector input format is "[v1,v2,...]" (string), not a JSON array.
function toPgVector(embedding: number[]): string {
  return `[${embedding.join(',')}]`
}

export class VectorRepository implements IVectorRepository {
  constructor(private client: SupabaseClient) {}

  async search(
    embedding: number[],
    threshold: number,
    count: number,
  ): Promise<RetrievedChunk[]> {
    const { data, error } = await this.client.rpc('match_documents', {
      query_embedding: toPgVector(embedding),
      match_threshold: threshold,
      match_count: count,
    })

    if (error) {
      throw new RetrievalFailedException(error.message)
    }

    const rows = (data ?? []) as MatchDocumentsRow[]
    return rows.map((row) =>
      RetrievedChunk.create({
        id: row.id,
        sourceType: row.source_type as RetrievedChunkSource,
        sourceId: row.source_id,
        documentId: row.document_id,
        content: row.content,
        similarity: row.similarity,
        metadata: row.metadata ?? {},
      }),
    )
  }

  async upsert(rows: VectorUpsertRow[]): Promise<void> {
    if (rows.length === 0) return
    const payload = rows.map((row) => ({
      source_type: row.sourceType,
      source_id: row.sourceId,
      document_id: row.documentId,
      chunk_index: row.chunkIndex,
      content: row.content,
      embedding: toPgVector(row.embedding),
      metadata: row.metadata ?? {},
    }))
    const { error } = await this.client.from('document_embeddings').insert(payload)
    if (error) {
      console.error('[VectorRepository.upsert] error:', error)
      throw error
    }
  }

  async deleteBySource(
    sourceType: RetrievedChunkSource,
    sourceId: string,
  ): Promise<void> {
    const { error } = await this.client
      .from('document_embeddings')
      .delete()
      .eq('source_type', sourceType)
      .eq('source_id', sourceId)
    if (error) throw error
  }

  async deleteByDocument(documentId: string): Promise<void> {
    const { error } = await this.client
      .from('document_embeddings')
      .delete()
      .eq('document_id', documentId)
    if (error) throw error
  }
}
