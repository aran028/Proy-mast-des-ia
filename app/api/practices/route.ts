import { NextResponse } from 'next/server'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import {
  GetAllPracticesUseCase,
  GetPracticesByPlaylistUseCase,
  GetPracticesByToolUseCase
} from '@/application/use-cases/practice'

// GET /api/practices — Obtener todas las practices (público)
// Query params opcionales: ?playlist=id o ?tool=id
export async function GET(request: Request) {
  try {
    const { practice } = await createRepositories()
    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get('playlist')
    const toolId = searchParams.get('tool')

    let data
    if (playlistId) {
      data = await new GetPracticesByPlaylistUseCase(practice).execute(playlistId)
    } else if (toolId) {
      data = await new GetPracticesByToolUseCase(practice).execute(toolId)
    } else {
      data = await new GetAllPracticesUseCase(practice).execute()
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
