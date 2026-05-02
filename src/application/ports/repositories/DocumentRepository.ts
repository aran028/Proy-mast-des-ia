export interface DocumentRecord {
  id: string
  title: string
  filename: string
  mime_type: string
  size_bytes: number
  uploaded_by: string | null
  created_at: string
}

export interface DocumentInsert {
  title: string
  filename: string
  mime_type: string
  size_bytes: number
  uploaded_by: string | null
}

export interface IDocumentRepository {
  findAll(): Promise<DocumentRecord[]>
  findById(id: string): Promise<DocumentRecord | null>
  create(data: DocumentInsert): Promise<DocumentRecord>
  delete(id: string): Promise<void>
}
