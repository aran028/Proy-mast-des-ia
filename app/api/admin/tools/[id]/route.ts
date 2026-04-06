import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { UpdateToolUseCase, DeleteToolUseCase } from '@/application/use-cases/tool'

interface Params {
  params: Promise<{ id: string }>
}

// PATCH /api/admin/tools/[id] — Actualizar tool
export async function PATCH(request: Request, { params }: Params) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()
    const { tool } = await createRepositories()

    const result = await new UpdateToolUseCase(tool).execute(id, {
      name: body.name,
      summary: body.summary,
      website: body.website,
      image: body.image,
      tags: body.tags,
    })

    return NextResponse.json(result)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

// DELETE /api/admin/tools/[id] — Eliminar tool
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { tool } = await createRepositories()

    await new DeleteToolUseCase(tool).execute(id)

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
