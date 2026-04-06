import { createClient } from '@/infrastructure/database/supabase/server'
import { PlaylistRepository } from '@/infrastructure/database/repositories/Playlist.repository'
import { ToolRepository } from '@/infrastructure/database/repositories/Tool.repository'
import { PracticeRepository } from '@/infrastructure/database/repositories/Practice.repository'

export async function createRepositories() {
  const supabase = await createClient()
  return {
    playlist: new PlaylistRepository(supabase),
    tool: new ToolRepository(supabase),
    practice: new PracticeRepository(supabase),
  }
}
