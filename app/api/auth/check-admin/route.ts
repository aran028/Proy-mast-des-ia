import { NextResponse } from 'next/server'
import { createClient } from '@/infrastructure/database/supabase/server'

// GET /api/auth/check-admin — Verificar si el usuario actual es admin
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ isAdmin: false })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return NextResponse.json({ isAdmin: profile?.role === 'admin' })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json({ isAdmin: false, error: message }, { status: 500 })
  }
}
