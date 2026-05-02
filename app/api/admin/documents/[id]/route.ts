import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createAdminRepositories } from '@/infrastructure/config/repository.factory'
import { DeleteDocumentUseCase } from '@/application/use-cases/chat'
import { DocumentNotFoundException } from '@/domain/exceptions'

export const runtime = 'nodejs'

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const { document, vector } = createAdminRepositories()

    await new DeleteDocumentUseCase(document, vector).execute(id)
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    if (error instanceof DocumentNotFoundException) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }
    console.error('[admin/documents DELETE] error:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
