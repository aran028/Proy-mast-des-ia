import { NextResponse } from 'next/server'
import { createServiceClient } from '@/infrastructure/database/supabase/server'
import { verifyAdmin } from '@/infrastructure/config/admin.guard'

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // 2. Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // 3. Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'La imagen no debe superar los 5MB' },
        { status: 400 }
      )
    }

    // 4. Generar nombre único para el archivo
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(7)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}-${random}.${extension}`

    // 5. Convertir el archivo a ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // 6. Cliente con Service Role Key (necesario para Storage)
    const supabase = createServiceClient()

    // 7. Subir el archivo a Supabase Storage
    const { error } = await supabase.storage
      .from('tools-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      return NextResponse.json(
        { success: false, error: `Error al subir la imagen: ${error.message}` },
        { status: 500 }
      )
    }

    // 8. Obtener la URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('tools-images')
      .getPublicUrl(fileName)

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    })

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
