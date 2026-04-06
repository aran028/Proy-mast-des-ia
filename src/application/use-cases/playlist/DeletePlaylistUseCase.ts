import type { IPlaylistRepository } from '@/application/ports/repositories'
import { PlaylistNotFoundException } from '@/domain/exceptions'

export class DeletePlaylistUseCase {
  constructor(private playlistRepository: IPlaylistRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.playlistRepository.findById(id)
    if (!existing) throw new PlaylistNotFoundException(id)

    return this.playlistRepository.delete(id)
  }
}
