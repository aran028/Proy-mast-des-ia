'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Sidebar } from '@/presentation/components/layout/sidebar'
import { Header } from '@/presentation/components/layout/header'
import { Breadcrumb } from '@/presentation/components/layout/breadcrumb'
import { Footer } from '@/presentation/components/layout/footer'
import { HeroSection } from '@/presentation/components/features/hero-section'
import { PlaylistCards } from '@/presentation/components/features/playlist-card'
import { ToolGrid } from '@/presentation/components/features/tool-grid'
import { Skeleton } from '@/presentation/components/ui/skeleton'
import { usePlaylists, useTools, useAuth } from '@/presentation/hooks'
import { VideoGallery } from '@/presentation/components/features/video-gallery'
import { PlayCircle } from 'lucide-react'

function HomeContent() {
  const searchParams = useSearchParams()
  const playlistId = searchParams.get('playlist')
  const section = searchParams.get('section')
  const highlightId = searchParams.get('highlight')

  const { user } = useAuth()
  const { playlists, loading: loadingPlaylists } = usePlaylists()
  const { tools, loading: loadingTools } = useTools(playlistId || undefined)

  const [searchQuery, setSearchQuery] = useState('')

  const activePlaylist = playlists.find(p => p.id === playlistId)

  let breadcrumbItems: { label: string; href?: string }[]
  if (activePlaylist) {
    breadcrumbItems = [
      { label: 'Inicio', href: '/' },
      { label: 'Playlists', href: '/' },
      { label: activePlaylist.name },
    ]
  } else if (section === 'latest-youtube-videos') {
    breadcrumbItems = [
      { label: 'Inicio', href: '/' },
      { label: 'Vídeos de YouTube' },
    ]
  } else {
    breadcrumbItems = [{ label: 'Inicio' }]
  }

  const [shuffleSeed] = useState(() => Math.random())

  const featuredTools = useMemo(() => {
    if (tools.length <= 5) return tools
    return tools
      .map((tool, i) => ({ tool, key: Math.sin(shuffleSeed * (i + 1)) }))
      .sort((a, b) => a.key - b.key)
      .slice(0, 5)
      .map(({ tool }) => tool)
  }, [tools, shuffleSeed])

  useEffect(() => {
    if (!highlightId || loadingTools) return
    const el = document.getElementById(`tool-${highlightId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightId, loadingTools])

  useEffect(() => {
    if (section !== 'latest-youtube-videos' || loadingPlaylists || loadingTools || playlistId) {
      return
    }

    const latestYoutubeSection = document.getElementById('latest-youtube-videos')
    if (latestYoutubeSection) {
      latestYoutubeSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [section, loadingPlaylists, loadingTools, playlistId])

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

        <div className="flex-1 overflow-y-auto px-6 pb-32">
          {activePlaylist ? (
            <div>
              <div className="sticky top-0 z-30 bg-black -mx-6 px-6 pt-6 pb-8 border-b border-zinc-800">
                <Breadcrumb items={breadcrumbItems} />
                <p className="text-md font-bold uppercase tracking-widest text-pink-500 mt-3">
                  Playlist
                </p>
                <h1 className="text-4xl font-extrabold text-white mt-2">
                  {activePlaylist.name}
                </h1>
                {activePlaylist.description && (
                  <p className="text-zinc-400 mt-2 max-w-3xl">{activePlaylist.description}</p>
                )}
              </div>

              {tools.length > 0 && (
                <ToolGrid tools={tools} title="TOOLS" highlightId={highlightId} />
              )}

              <VideoGallery
                playlistId={playlistId || undefined}
                title="Videos de YouTube"
                titleIcon={<PlayCircle className="size-5 text-red-500" />}
              />
            </div>
          ) : (
            <div>
              <div className="sticky top-0 z-30 bg-black -mx-6 px-6 py-4 border-b border-zinc-800">
                <Breadcrumb items={breadcrumbItems} />
              </div>
              <div className="pt-6">
                <HeroSection tools={featuredTools} playlists={playlists} />
                <PlaylistCards playlists={playlists} />
                <div id="latest-youtube-videos" className="scroll-mt-24">
                  <VideoGallery
                    title="Vídeos de YouTube"
                    titleIcon={<PlayCircle className="size-5 text-red-500" />}
                  />
                </div>
              </div>
            </div>
          )}
          <Footer />
        </div>
      </main>
    </div>
  )
}

export default function HomeClient() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-black">
          <Sidebar playlists={[]} />
          <main className="flex-1 ml-[72px] sm:ml-[240px] lg:ml-[280px] p-6">
            <Skeleton className="h-64 w-full" />
          </main>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  )
}
