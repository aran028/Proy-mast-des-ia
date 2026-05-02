import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import {
  createAdminRepositories,
  getEmbeddingService,
} from '@/infrastructure/config/repository.factory'
import { IndexCatalogUseCase } from '@/application/use-cases/chat'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST() {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tool, playlist, video, vector } = createAdminRepositories()

    const result = await new IndexCatalogUseCase(
      tool,
      playlist,
      video,
      getEmbeddingService(),
      vector,
    ).execute()

    return NextResponse.json({ success: true, ...result })
  } catch (error: unknown) {
    console.error('[reindex-catalog] error:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
