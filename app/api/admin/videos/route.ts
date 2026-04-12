/**
 * API Route: /api/admin/videos
 *
 * GET: Lista todos los videos (incluyendo pending y rejected)
 * POST: Crea un nuevo video manualmente
 */

import { NextResponse } from 'next/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { CreateVideoUseCase } from '@/application/use-cases/video'
import { createClient } from '@/infrastructure/database/supabase/server'

export async function GET() {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Obtener todos los videos (sin filtrar por status) — query directa para admin
    const supabase = await createClient()
    const { data: videos, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(videos)
  } catch (error) {
    console.error('Error fetching videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { video: videoRepository } = await createRepositories()
    const useCase = new CreateVideoUseCase(videoRepository)

    const { video, created } = await useCase.execute(body)

    return NextResponse.json(video, { status: created ? 201 : 200 })
  } catch (error) {
    console.error('Error creating video:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create video' },
      { status: 500 }
    )
  }
}
