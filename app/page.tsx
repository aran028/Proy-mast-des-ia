'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/presentation/components/layout/sidebar'
import { Header } from '@/presentation/components/layout/header'
import { HeroSection } from '@/presentation/components/features/hero-section'
import { PlaylistCards } from '@/presentation/components/features/playlist-card'
import { ToolGrid } from '@/presentation/components/features/tool-grid'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { usePlaylists, useTools, usePractices, useAuth } from '@/presentation/hooks'
import { VideoGallery } from '@/presentation/components/features/video-gallery'

export default function HomePage() {
  const searchParams = useSearchParams()
  const playlistId = searchParams.get('playlist')
  
  const { user } = useAuth()
  const { playlists, loading: loadingPlaylists } = usePlaylists()
  const { tools, loading: loadingTools } = useTools(playlistId || undefined)
  const { practices, loading: loadingPractices } = usePractices(playlistId || undefined)

  const [searchQuery, setSearchQuery] = useState('')

  const activePlaylist = playlists.find(p => p.id === playlistId)

  if (loadingPlaylists || loadingTools) {
    return (
      <div className="flex h-screen bg-black">
        <Sidebar playlists={[]} />
        <main className="flex-1 ml-[72px] sm:ml-[240px] lg:ml-[280px] p-6">
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-5 gap-4">
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-black">
      <Sidebar playlists={playlists} activePlaylist={playlistId} />
      
      <main className="flex-1 ml-[72px] sm:ml-[240px] lg:ml-[280px] flex flex-col overflow-hidden">
        <Header onSearch={setSearchQuery} user={user} />
        
        <div className="flex-1 overflow-y-auto p-6 pb-32">
          {/* Playlist seleccionada */}
          {activePlaylist ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-pink-500">
                Playlist
              </p>
              <h1 className="text-4xl font-extrabold text-white mt-2 mb-4">
                {activePlaylist.name}
              </h1>
              {activePlaylist.description && (
                <p className="text-zinc-400 mb-8 max-w-3xl">{activePlaylist.description}</p>
              )}
              
              {/* Tools de la playlist */}
              {tools.length > 0 && (
                <ToolGrid tools={tools} title="TOOLS" />
              )}
              
              {/* Prácticas */}
              {practices.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-white mb-4">Prácticas</h2>
                  <div className="space-y-2">
                    {practices.map(practice => (
                      <div key={practice.id} className="bg-zinc-900 p-4 rounded-lg">
                        <h3 className="font-medium text-white">{practice.title}</h3>
                        <p className="text-sm text-zinc-500">{practice.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Galería de videos de la playlist */}
              <VideoGallery 
                playlistId={playlistId || undefined} 
                title="Videos de YouTube" 
              />



            </div>
          ) : (
            /* Home sin playlist - vista principal */
            <div>
              {/* Carrusel Hero */}
              <HeroSection tools={tools.slice(0, 5)} />
              
              {/* Cards de playlists */}
              <PlaylistCards playlists={playlists} />
              
              {/* Galería de videos - Todos los videos */}
              <VideoGallery title="Últimos videos de IA" />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
