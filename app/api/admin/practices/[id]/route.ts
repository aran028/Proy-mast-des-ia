import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { UpdatePracticeUseCase, DeletePracticeUseCase } from '@/application/use-cases/practice'
import type { PracticeType } from '@/domain/entities'

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/admin/practices/[id] — Actualizar práctica
export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { practice } = await createRepositories()

    const result = await new UpdatePracticeUseCase(practice).execute(id, {
      title: body.title,
      description: body.description,
      type: body.type as PracticeType | undefined,
      toolId: body.toolId,
      playlistId: body.playlistId,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// DELETE /api/admin/practices/[id] — Eliminar práctica
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { practice } = await createRepositories()

    await new DeletePracticeUseCase(practice).execute(id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
