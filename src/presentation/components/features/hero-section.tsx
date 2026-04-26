'use client'

import { useState, useEffect} from 'react'
import { ChevronLeft, ChevronRight} from 'lucide-react'
import type { Tables } from '@/shared/types/database.types'
import { getPlaylistIconEmoji } from '@/shared/constants/playlist-icons'

type Tool = Tables<'tools'>
type Playlist = Tables<'playlists'>
interface HeroSectionProps {
  tools: Tool[]
  playlists?: Playlist[]
}

export function HeroSection({ tools, playlists = [] }: HeroSectionProps) {
  const [current, setCurrent] = useState(0)


  useEffect(() => {
    if (tools.length <= 1) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % tools.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [tools.length])

  if (!tools.length) return null


  const featured = tools[current]
  const featuredPlaylist = playlists.find(p => p.id === featured.playlist_id)

  const goTo = (index: number) => {
    setCurrent(index)
  }

  return (
    <section className="relative mb-8 overflow-hidden rounded-xl bg-zinc-900 border border-pink-500">
      <div className="relative px-8 pb-8 pt-10">
        {/* Label */}
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-pink-500 mb-5">
          {featuredPlaylist ? (
            <>
              <span className="text-base leading-none">{getPlaylistIconEmoji(featuredPlaylist.icon)}</span>
              <span>{featuredPlaylist.name}</span>
            </>
          ) : (
            'TOOLS'
          )}
        </div>

        {/* Content */}
         {tools.length > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => goTo((current - 1 + tools.length) % tools.length)}
              className="flex size-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:bg-pink-500 transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="size-20" />
            </button>

        <a
          href={featured.website ?? undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col gap-6 group cursor-pointer"
        >
          <div className="flex-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl lg:text-5xl leading-tight group-hover:text-pink-500 transition-colors">
              {featured.name}
            </h1>
            <p className="mt-3 text-base text-white leading-relaxed">
              {featured.summary}
            </p>
            
            {/* Tags */}
            {featured.tags && featured.tags.length > 0 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                {featured.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-zinc-600 text-pink-500 px-2 py-1  hover:text-white hover:bg-pink-500 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </a>
          <button
              onClick={() => goTo((current + 1) % tools.length)}
              className="flex size-8 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 hover:text-white hover:bg-pink-500 transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="size-20" />
            </button>
          </div>
        )}

        {/* Navigation dots */}
        {tools.length > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1.5">
            {tools.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-pink-500' : 'w-2 bg-zinc-700 hover:bg-zinc-600'
                }`}
                aria-label={`Ir a slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
