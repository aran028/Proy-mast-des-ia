import { redirect } from 'next/navigation'
import { createClient } from '@/infrastructure/database/supabase/server'
import Link from 'next/link'
import { Home, LayoutDashboard } from 'lucide-react'
import { AdminNavLinks } from './admin-nav-links'

export default async function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-8">
            <span className="text-lg font-bold tracking-tight text-pink-500">
              <LayoutDashboard className="h-8 w-8 text-white hover:text-pink-500 hover:scale-110" />
            </span>

            <AdminNavLinks />
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-zinc-400 hover:text-pink-500 transition-all hover:-translate-x-1"
          >
            <Home className="size-5"/>
            <span className="hidden sm:inline text-sm font-medium">Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6">
        {children}
      </main>
    </div>
  )
}

