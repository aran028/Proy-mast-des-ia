'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/presentation/components/layout/sidebar'
import { useAuth, usePlaylists, useTools } from '@/presentation/hooks'
import { Spinner } from '@/presentation/components/ui/spinner'

export default function DashboardPage() {
  const { user, loading: loadingAuth, signOut } = useAuth()
  const { playlists } = usePlaylists()
  const router = useRouter()

  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login')
    }
  }, [user, loadingAuth, router])

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar playlists={playlists} />
      
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          <h1 className="text-2xl font-bold text-white mb-2">Mi Dashboard</h1>
          <p className="text-zinc-400 mb-8">Bienvenido, {user.email}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h3 className="text-zinc-400 text-sm">Playlists</h3>
              <p className="text-2xl font-bold text-white">{playlists.length}</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h3 className="text-zinc-400 text-sm">Herramientas</h3>
              <p className="text-2xl font-bold text-white">-</p>
            </div>
            <div className="bg-zinc-900 p-6 rounded-lg">
              <h3 className="text-zinc-400 text-sm">Prácticas guardadas</h3>
              <p className="text-2xl font-bold text-white">-</p>
            </div>
          </div>

          <button
            onClick={async () => {
              await signOut()
              router.push('/')
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Cerrar sesión
          </button>
        </div>
      </main>
    </div>
  )
}
