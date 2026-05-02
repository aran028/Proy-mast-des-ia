import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DocumentInsert,
  DocumentRecord,
  IDocumentRepository,
} from '@/application/ports/repositories'

export class DocumentRepository implements IDocumentRepository {
  constructor(private client: SupabaseClient) {}

  async findAll(): Promise<DocumentRecord[]> {
    const { data, error } = await this.client
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []) as DocumentRecord[]
  }

  async findById(id: string): Promise<DocumentRecord | null> {
    const { data, error } = await this.client
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data as DocumentRecord
  }

  async create(input: DocumentInsert): Promise<DocumentRecord> {
    const { data, error } = await this.client
      .from('documents')
      .insert(input)
      .select()
      .single()
    if (error) throw error
    return data as DocumentRecord
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.client.from('documents').delete().eq('id', id)
    if (error) throw error
  }
}
