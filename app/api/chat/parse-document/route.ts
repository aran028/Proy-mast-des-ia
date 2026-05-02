import { NextResponse } from 'next/server'
import { createClient } from '@/infrastructure/database/supabase/server'
import {
  extractText,
  isSupportedMime,
} from '@/infrastructure/external/parsers/document-parser'

export const runtime = 'nodejs'

const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_OUTPUT_CHARS = 50_000

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

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `File exceeds ${MAX_FILE_BYTES / 1024 / 1024} MB` },
        { status: 400 },
      )
    }

    const mimeType = resolveMimeType(file)
    if (!isSupportedMime(mimeType)) {
      return NextResponse.json(
        { error: `Unsupported mime type: ${file.type || 'unknown'}` },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const fullText = await extractText(buffer, mimeType)

    if (!fullText) {
      return NextResponse.json(
        { error: 'No extractable text in file' },
        { status: 400 },
      )
    }

    const truncated = fullText.length > MAX_OUTPUT_CHARS
    const content = truncated ? fullText.slice(0, MAX_OUTPUT_CHARS) : fullText

    return NextResponse.json({
      success: true,
      name: file.name,
      content,
      truncated,
      originalLength: fullText.length,
    })
  } catch (error: unknown) {
    console.error('[chat/parse-document] error:', error)
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
