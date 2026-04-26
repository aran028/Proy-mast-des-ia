/**
 * API Route: /api/admin/videos/[id]
 *
 * GET: Obtiene un video por ID
 * PATCH: Actualiza un video (aprobar/rechazar, editar datos)
 * DELETE: Elimina un video
 */

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { UpdateVideoUseCase, DeleteVideoUseCase } from '@/application/use-cases/video'
import type { TablesUpdate } from '@/shared/types/database.types'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { video: videoRepository } = await createRepositories()
    const video = await videoRepository.findById(id)

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error fetching video:', error)
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const asNullableString = (value: unknown): string | null | undefined => {
      if (value === undefined) return undefined
      if (value === null || value === '') return null
      if (typeof value === 'string') return value
      if (typeof value === 'number' || typeof value === 'boolean') return `${value}`
      return null
    }

    const asNullableNumber = (value: unknown): number | null | undefined => {
      if (value === undefined) return undefined
      if (value === null || value === '') return null
      const parsed = Number(value)
      return Number.isFinite(parsed) ? parsed : null
    }

    const asTags = (value: unknown): string[] | null | undefined => {
      if (value === undefined) return undefined
      if (value === null) return null
      if (!Array.isArray(value)) return undefined
      return value.map(String).filter(Boolean)
    }

    const platformValue = asNullableString(body.platform)
    const statusValue = asNullableString(body.status)

    const payload: TablesUpdate<'videos'> = {
      title: asNullableString(body.title) ?? undefined,
      video_url: asNullableString(body.videoUrl) ?? undefined,
      platform:
        platformValue === 'youtube' || platformValue === 'instagram' || platformValue === 'tiktok'
          ? platformValue
          : undefined,
      platform_video_id: asNullableString(body.platformVideoId) ?? undefined,
      description: asNullableString(body.description),
      thumbnail_url: asNullableString(body.thumbnailUrl),
      author: asNullableString(body.author),
      author_url: asNullableString(body.authorUrl),
      view_count: asNullableNumber(body.viewCount),
      status:
        statusValue === 'approved' || statusValue === 'pending' || statusValue === 'rejected'
          ? statusValue
          : undefined,
      playlist_id: asNullableString(body.playlistId),
      tool_id: asNullableString(body.toolId),
      tags: asTags(body.tags),
    }

    const normalizedPayload = Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined)
    ) as TablesUpdate<'videos'>

    const { video: videoRepository } = await createRepositories()
    const useCase = new UpdateVideoUseCase(videoRepository)

    const video = await useCase.execute(id, normalizedPayload)

    return NextResponse.json(video)
  } catch (error) {
    console.error('Error updating video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update video' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { video: videoRepository } = await createRepositories()
    const useCase = new DeleteVideoUseCase(videoRepository)

    await useCase.execute(id)

    return NextResponse.json({ message: 'Video deleted successfully' })
  } catch (error) {
    console.error('Error deleting video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete video' },
      { status: 500 }
    )
  }
}
