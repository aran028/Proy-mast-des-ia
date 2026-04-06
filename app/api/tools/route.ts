import { NextResponse } from 'next/server'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { 
  GetAllToolsUseCase, 
  GetToolsByPlaylistUseCase, 
  SearchToolsUseCase 
} from '@/application/use-cases/tool'

// GET /api/tools — Obtener todas las tools (público)
// Query params opcionales: ?playlist=id o ?search=term
export async function GET(request: Request) {
  try {
    const { tool } = await createRepositories()
    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get('playlist')
    const search = searchParams.get('search')

    let data
    if (playlistId) {
      data = await new GetToolsByPlaylistUseCase(tool).execute(playlistId)
    } else if (search) {
      data = await new SearchToolsUseCase(tool).execute(search)
    } else {
      data = await new GetAllToolsUseCase(tool).execute()
    }

    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
