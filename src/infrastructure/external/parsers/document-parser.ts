import { UnsupportedDocumentTypeException } from '@/domain/exceptions'

const PDF_MIME = 'application/pdf'
const MD_MIMES = new Set(['text/markdown', 'text/x-markdown'])
const TXT_MIME = 'text/plain'

const SUPPORTED_MIMES = [PDF_MIME, ...MD_MIMES, TXT_MIME]

export function isSupportedMime(mimeType: string): boolean {
  return SUPPORTED_MIMES.includes(mimeType) || MD_MIMES.has(mimeType)
}

export async function extractText(
  buffer: Buffer,
  mimeType: string,
): Promise<string> {
  if (mimeType === PDF_MIME) {
    const { PDFParse } = await import('pdf-parse')
    const parser = new PDFParse({ data: new Uint8Array(buffer) })
    try {
      const result = await parser.getText()
      return result.text.trim()
    } finally {
      await parser.destroy()
    }
  }

  if (MD_MIMES.has(mimeType) || mimeType === TXT_MIME) {
    return buffer.toString('utf-8').trim()
  }

  throw new UnsupportedDocumentTypeException(mimeType)
}

export interface Chunk {
  index: number
  content: string
}

export function chunkText(
  text: string,
  options: { chunkSize?: number; overlap?: number } = {},
): Chunk[] {
  const chunkSize = options.chunkSize ?? 1500
  const overlap = options.overlap ?? 200
  if (overlap >= chunkSize) {
    throw new Error('overlap must be smaller than chunkSize')
  }

  const normalized = text.replace(/\r\n/g, '\n').trim()
  if (!normalized) return []

  const chunks: Chunk[] = []
  let start = 0
  let index = 0
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length)
    let sliceEnd = end
    if (end < normalized.length) {
      const breakAt = normalized.lastIndexOf('\n', end)
      if (breakAt > start + chunkSize / 2) {
        sliceEnd = breakAt
      }
    }
    const content = normalized.slice(start, sliceEnd).trim()
    if (content) {
      chunks.push({ index, content })
      index += 1
    }
    if (sliceEnd >= normalized.length) break
    start = Math.max(sliceEnd - overlap, start + 1)
  }

  return chunks
}
