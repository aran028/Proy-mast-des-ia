/**
 * API Route: /api/videos
 * 
 * GET: Obtiene videos (públicos, solo aprobados)
 * POST: Crea un nuevo video (usado por n8n webhook)
 */

import { NextResponse } from 'next/server'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import {
  GetAllVideosUseCase,
  GetVideosByPlaylistUseCase,
  GetVideosByToolUseCase,
  CreateVideoUseCase,
} from '@/application/use-cases/video'

function cleanStringArray(values: unknown[]): string[] | undefined {
  const tags = values
    .filter((value): value is string => typeof value === 'string')
    .map((tag) => tag.trim())
    .filter(Boolean)
  return tags.length > 0 ? tags : undefined
}

function normalizeTags(input: unknown): string[] | undefined {
  if (input == null) return undefined

  if (Array.isArray(input)) return cleanStringArray(input)

  if (typeof input !== 'string') return undefined

  const raw = input.trim()
  if (!raw) return undefined

  // Accept JSON string payloads from n8n, e.g. "[\"ai\",\"agents\"]".
  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return cleanStringArray(parsed)
    } catch {
      // Fall back to comma-separated parsing below.
    }
  }

  return cleanStringArray(raw.split(','))
}

export async function GET(request: Request) {
  try {
    const { video: videoRepository } = await createRepositories()

    const { searchParams } = new URL(request.url)
    const playlistId = searchParams.get('playlistId')
    const toolId = searchParams.get('toolId')

    let videos

    if (playlistId) {
      const useCase = new GetVideosByPlaylistUseCase(videoRepository)
      videos = await useCase.execute(playlistId)
    } else if (toolId) {
      const useCase = new GetVideosByToolUseCase(videoRepository)
      videos = await useCase.execute(toolId)
    } else {
      const useCase = new GetAllVideosUseCase(videoRepository)
      videos = await useCase.execute()
    }

    return NextResponse.json({ success: true, data: videos })
  } catch (error: unknown) {
    console.error('Error fetching videos:', error)
    let message = 'Error desconocido'
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      message = String((error as { message: unknown }).message)
    }
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { video: videoRepository } = await createRepositories()

    // Verificar API key de n8n (seguridad básica)
    const apiKey = request.headers.get('x-api-key')
    if (apiKey !== process.env.N8N_API_KEY) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const normalizedBody = {
      ...body,
      tags: normalizeTags(body?.tags),
    }
    const useCase = new CreateVideoUseCase(videoRepository)

    const { video, created } = await useCase.execute(normalizedBody)

    return NextResponse.json(video, { status: created ? 201 : 200 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create video' },
      { status: 500 }
    )
  }
}
