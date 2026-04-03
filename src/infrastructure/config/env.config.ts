export const config = {
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
} as const

export function getSupabaseUrl() {
  return config.supabase.url
}

export function getSupabaseAnonKey() {
  return config.supabase.anonKey
}

export function getSupabaseServiceKey() {
  return config.supabase.serviceRoleKey
}
