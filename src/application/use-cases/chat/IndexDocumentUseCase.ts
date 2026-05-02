import type {
  IDocumentRepository,
  IVectorRepository,
  VectorUpsertRow,
} from '@/application/ports/repositories'
import type { IEmbeddingService } from '@/application/ports/services'
import { ValidationException } from '@/domain/exceptions'
import { chunkText, extractText } from '@/infrastructure/external/parsers/document-parser'

export interface IndexDocumentInput {
  title: string
  filename: string
  mimeType: string
  buffer: Buffer
  uploadedBy: string | null
}

export interface IndexDocumentResult {
  documentId: string
  chunksIndexed: number
}

export class IndexDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly embeddingService: IEmbeddingService,
    private readonly vectorRepository: IVectorRepository,
  ) {}

  async execute(input: IndexDocumentInput): Promise<IndexDocumentResult> {
    if (!input.title.trim()) {
      throw new ValidationException('Document title is required')
    }
    if (!input.buffer || input.buffer.length === 0) {
      throw new ValidationException('Document buffer is empty')
    }

    const text = await extractText(input.buffer, input.mimeType)
    if (!text) {
      throw new ValidationException('Document has no extractable text')
    }

    const chunks = chunkText(text)
    if (chunks.length === 0) {
      throw new ValidationException('Document produced zero chunks')
    }

    const document = await this.documentRepository.create({
      title: input.title.trim(),
      filename: input.filename,
      mime_type: input.mimeType,
      size_bytes: input.buffer.length,
      uploaded_by: input.uploadedBy,
    })

    const embeddings = await this.embeddingService.embedBatch(
      chunks.map((c) => c.content),
    )

    const rows: VectorUpsertRow[] = chunks.map((chunk, idx) => ({
      sourceType: 'document',
      sourceId: null,
      documentId: document.id,
      chunkIndex: chunk.index,
      content: chunk.content,
      embedding: embeddings[idx],
      metadata: { title: document.title, filename: document.filename },
    }))

    await this.vectorRepository.upsert(rows)

    return { documentId: document.id, chunksIndexed: chunks.length }
  }
}
