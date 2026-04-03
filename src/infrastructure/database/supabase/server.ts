import { createClient } from '@supabase/supabase-js'

export function createServerClient() {  // Nombre que tú quieres
  return createClient(  // ← Llamar a createClient, no createServerClient
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
