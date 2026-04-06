import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { UpdatePlaylistUseCase, DeletePlaylistUseCase } from '@/application/use-cases/playlist'

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/admin/playlists/[id] — Actualizar playlist
export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { playlist } = await createRepositories()

    const result = await new UpdatePlaylistUseCase(playlist).execute(id, {
      name: body.name,
      description: body.description,
      icon: body.icon,
      color: body.color,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// DELETE /api/admin/playlists/[id] — Eliminar playlist
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { playlist } = await createRepositories()

    await new DeletePlaylistUseCase(playlist).execute(id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
