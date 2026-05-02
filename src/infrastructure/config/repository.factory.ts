import {
  createClient,
  createServiceClient,
} from '@/infrastructure/database/supabase/server'
import { PlaylistRepository } from '@/infrastructure/database/repositories/Playlist.repository'
import { ToolRepository } from '@/infrastructure/database/repositories/Tool.repository'
import { SupabaseVideoRepository } from '@/infrastructure/database/supabase/repositories/video.repository.impl'
import { VectorRepository } from '@/infrastructure/database/repositories/Vector.repository'
import { DocumentRepository } from '@/infrastructure/database/repositories/Document.repository'
import {
  AnthropicChatService,
  AnthropicPromptGeneratorService,
} from '@/infrastructure/external/anthropic'
import { OpenAIEmbeddingService } from '@/infrastructure/external/openai'
import type {
  IChatService,
  IEmbeddingService,
  IPromptGeneratorService,
} from '@/application/ports/services'

export async function createRepositories() {
  const supabase = await createClient()
  return {
    playlist: new PlaylistRepository(supabase),
    tool: new ToolRepository(supabase),
    video: new SupabaseVideoRepository(supabase),
    vector: new VectorRepository(supabase),
    document: new DocumentRepository(supabase),
  }
}

// Repos privilegiados (service role, bypassa RLS).
// Usar SOLO en endpoints que ya verifican admin a nivel aplicación.
export function createAdminRepositories() {
  const supabase = createServiceClient()
  return {
    playlist: new PlaylistRepository(supabase),
    tool: new ToolRepository(supabase),
    video: new SupabaseVideoRepository(supabase),
    vector: new VectorRepository(supabase),
    document: new DocumentRepository(supabase),
  }
}

export function getPromptGeneratorService(): IPromptGeneratorService {
  return new AnthropicPromptGeneratorService()
}

export function getEmbeddingService(): IEmbeddingService {
  return new OpenAIEmbeddingService()
}

export function getChatService(): IChatService {
  return new AnthropicChatService()
}
