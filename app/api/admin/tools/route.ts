import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { CreateToolUseCase } from '@/application/use-cases/tool'

// POST /api/admin/tools — Crear nueva tool
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { tool } = await createRepositories()

    const result = await new CreateToolUseCase(tool).execute({
      name: body.name,
      summary: body.summary,
      website: body.website,
      playlistId: body.playlistId,
      userId: admin.id,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
