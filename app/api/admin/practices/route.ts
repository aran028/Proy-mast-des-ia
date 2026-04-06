import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { CreatePracticeUseCase } from '@/application/use-cases/practice'
import type { PracticeType } from '@/domain/entities'

// POST /api/admin/practices — Crear nueva práctica
export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { practice } = await createRepositories()

    const result = await new CreatePracticeUseCase(practice).execute({
      title: body.title,
      description: body.description,
      type: body.type as PracticeType | undefined,
      playlistId: body.playlistId,
      toolId: body.toolId,
      userId: admin.id,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
