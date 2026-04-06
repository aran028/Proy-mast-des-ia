import { redirect } from 'next/navigation'
import { createClient } from '@/infrastructure/database/supabase/server'
import {Link} form 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-white font-semibold">Admin</span>
          <Link href="/admin/playlists" className="text-zinc-400 hover:text-white text-sm">Playlists</Link>
          <Link href="/admin/tools" className="text-zinc-400 hover:text-white text-sm">Tools</Link>
          <Link href="/admin/practices" className="text-zinc-400 hover:text-white text-sm">Practices</Link>
          <Link href="/" className="text-zinc-400 hover:text-white text-sm ml-auto">← Home</Link>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
