import { PlaylistCards } from './playlist-card'
import type { Tables } from '@/shared/types/database.types'

type Playlist = Tables<'playlists'>


interface PlaylistGridProps {
  playlists: Playlist[]
}

export function PlaylistGrid({ playlists }: PlaylistGridProps) {
  if (playlists.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-white mb-4">Categorías</h2>
      <PlaylistCards playlists={playlists} />
    </section>
  )
}
