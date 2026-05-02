import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import {
  createAdminRepositories,
  getEmbeddingService,
} from '@/infrastructure/config/repository.factory'
import { IndexDocumentUseCase } from '@/application/use-cases/chat'
import { isSupportedMime } from '@/infrastructure/external/parsers/document-parser'

export const runtime = 'nodejs'

const EXTENSION_TO_MIME: Record<string, string> = {
  pdf: 'application/pdf',
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
}

function resolveMimeType(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') return file.type
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext ? EXTENSION_TO_MIME[ext] ?? file.type ?? '' : file.type ?? ''
}

export async function GET() {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { document } = createAdminRepositories()
    const data = await document.findAll()
    return NextResponse.json({ success: true, data })
  } catch (error: unknown) {
    console.error('[admin/documents GET] error:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const titleField = formData.get('title')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }
    const mimeType = resolveMimeType(file)
    if (!isSupportedMime(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported mime type: ${file.type || 'unknown'}` },
        { status: 400 },
      )
    }

    const title =
      typeof titleField === 'string' && titleField.trim()
        ? titleField.trim()
        : file.name

    const buffer = Buffer.from(await file.arrayBuffer())
    const { document, vector } = createAdminRepositories()

    const result = await new IndexDocumentUseCase(
      document,
      getEmbeddingService(),
      vector,
    ).execute({
      title,
      filename: file.name,
      mimeType,
      buffer,
      uploadedBy: admin.id,
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error: unknown) {
    console.error('[admin/documents POST] error:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
