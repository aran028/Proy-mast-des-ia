'use client'

import { useRef } from 'react'
import { useVideos } from '@/presentation/hooks/useVideos'
import { VideoCard } from './video-card'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface VideoGalleryProps {
  playlistId?: string
  toolId?: string
  title?: string
}

export function VideoGallery({
  playlistId,
  toolId,
  title = 'Videos',
}: VideoGalleryProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { videos, loading, error } = useVideos(playlistId, toolId)

  const scroll = (direction: 'left' | 'right') => {
    const containerWidth = scrollContainerRef.current?.clientWidth ?? 300
    scrollContainerRef.current?.scrollBy({
      left: direction === 'left' ? -containerWidth : containerWidth,
      behavior: 'smooth',
    })
  }

  if (loading) {
    return (
      <section className="mt-8">
        <div className="h-6 w-40 bg-zinc-800 animate-pulse rounded mb-4" />
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-none w-32 sm:w-36 md:w-40 lg:w-44 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
              <div className="aspect-video bg-zinc-800 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-zinc-800 animate-pulse rounded" />
                <div className="h-3 bg-zinc-800 animate-pulse rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error || videos.length === 0) return null

  return (
    <section className="mt-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <span className="text-xs text-zinc-500">
          {videos.length} {videos.length === 1 ? 'video' : 'videos'}
        </span>
      </div>

      {/* Scroll horizontal con flechas */}
      <div className="relative group/gallery">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {videos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/70 hover:bg-black text-white opacity-0 group-hover/gallery:opacity-100 transition-opacity"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  )
}
