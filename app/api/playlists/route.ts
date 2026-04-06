import { NextResponse } from 'next/server'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { GetAllPlaylistsUseCase } from '@/application/use-cases/playlist'

// GET /api/playlists — Obtener todas las playlists (público)
export async function GET() {
  try {
    const { playlist } = await createRepositories()
    const data = await new GetAllPlaylistsUseCase(playlist).execute()
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
