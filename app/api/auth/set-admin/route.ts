import { NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/infrastructure/database/supabase/server'

// POST /api/auth/set-admin — Asignar rol admin al usuario actual (solo desarrollo)
export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 })
  }

  try {
    // Cliente con cookies para identificar al usuario autenticado
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'No user found' }, { status: 401 })
    }

    // Cliente con Service Role Key para modificar perfiles (bypassa RLS)
    const adminSupabase = createServiceClient()

    const { data: existingProfile } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!existingProfile) {
      const { error: insertError } = await adminSupabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          role: 'admin'
        })

      if (insertError) {
        return NextResponse.json({
          success: false,
          error: insertError.message
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Profile created with admin role',
        user: { id: user.id, email: user.email, role: 'admin' }
      })
    }

    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({
        success: false,
        error: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Role updated to admin',
      user: { id: user.id, email: user.email, role: 'admin' }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
