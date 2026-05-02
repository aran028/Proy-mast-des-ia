import type { ChatMessage, RetrievedChunk } from '@/domain/value-objects'

export interface AttachedDocument {
  name: string
  content: string
}

export interface ChatStreamInput {
  messages: ChatMessage[]
  context: RetrievedChunk[]
  attachedDocument?: AttachedDocument | null
}

export interface IChatService {
  stream(input: ChatStreamInput): AsyncIterable<string>
}
