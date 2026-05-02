import type {
  IDocumentRepository,
  IVectorRepository,
} from '@/application/ports/repositories'
import { DocumentNotFoundException } from '@/domain/exceptions'

export class DeleteDocumentUseCase {
  constructor(
    private readonly documentRepository: IDocumentRepository,
    private readonly vectorRepository: IVectorRepository,
  ) {}

  async execute(documentId: string): Promise<void> {
    const document = await this.documentRepository.findById(documentId)
    if (!document) {
      throw new DocumentNotFoundException(documentId)
    }

    await this.vectorRepository.deleteByDocument(documentId)
    await this.documentRepository.delete(documentId)
  }
}
