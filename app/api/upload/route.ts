import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { createServiceClient } from '@/infrastructure/database/supabase/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'
import { detectImage } from '@/infrastructure/security/image-validator'

export const runtime = 'nodejs'

const MAX_BYTES = 5 * 1024 * 1024

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: 'La imagen no debe superar los 5MB' },
        { status: 400 },
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Validar el tipo real por firma binaria — nunca confiar en file.type ni file.name.
    const detected = detectImage(buffer)
    if (!detected) {
      return NextResponse.json(
        { success: false, error: 'Formato no permitido. Usa PNG, JPG, WEBP o GIF.' },
        { status: 400 },
      )
    }

    // Nombre 100% generado en servidor: extensión y mime los pone el detector,
    // no el cliente. Imposible que se cuele un .html / .svg con MIME spoofeado.
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}.${detected.ext}`

    const supabase = createServiceClient()

    const { error } = await supabase.storage
      .from('tools-images')
      .upload(fileName, buffer, {
        contentType: detected.mime,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('[upload] storage error:', error)
      return NextResponse.json(
        { success: false, error: 'No se pudo subir la imagen' },
        { status: 500 },
      )
    }

    const { data: { publicUrl } } = supabase.storage
      .from('tools-images')
      .getPublicUrl(fileName)

    return NextResponse.json({ success: true, url: publicUrl, fileName })
  } catch (error: unknown) {
    console.error('[upload] error:', error)
    return NextResponse.json(
      { success: false, error: 'Error desconocido' },
      { status: 500 },
    )
  }
}
