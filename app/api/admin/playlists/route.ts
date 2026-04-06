import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { CreatePlaylistUseCase } from '@/application/use-cases/playlist'

// POST /api/admin/playlists — Crear nueva playlist
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { playlist } = await createRepositories()

    const result = await new CreatePlaylistUseCase(playlist).execute({
      name: body.name,
      description: body.description,
      icon: body.icon,
      color: body.color,
      userId: admin.id,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
