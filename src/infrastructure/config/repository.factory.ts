import { createClient } from '@/infrastructure/database/supabase/server'
import { PlaylistRepository } from '@/infrastructure/database/repositories/Playlist.repository'
import { ToolRepository } from '@/infrastructure/database/repositories/Tool.repository'
import { SupabaseVideoRepository } from '@/infrastructure/database/supabase/repositories/video.repository.impl'
import { AnthropicPromptGeneratorService } from '@/infrastructure/external/anthropic'
import type { IPromptGeneratorService } from '@/application/ports/services'

export async function createRepositories() {
  const supabase = await createClient()
  return {
    playlist: new PlaylistRepository(supabase),
    tool: new ToolRepository(supabase),
    video: new SupabaseVideoRepository(supabase),
  }
}

export function getPromptGeneratorService(): IPromptGeneratorService {
  return new AnthropicPromptGeneratorService()
}
