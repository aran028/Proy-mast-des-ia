'use client'

import { Play, User } from 'lucide-react'
import { Card } from '../ui/card'
import Image from 'next/image'
import type { Video } from '@/presentation/hooks/useVideos'

interface VideoCardProps {
  video: Video
  playlistName?: string | null
  playlistColor?: string | null   
}

function getVideoUrl(video: Video): string {
  if (video.videoUrl && URL.canParse(video.videoUrl)) return video.videoUrl
  if (video.platform === 'youtube' && video.platformVideoId) {
    return `https://www.youtube.com/watch?v=${video.platformVideoId}`
  }
  if (video.platform === 'instagram' && video.platformVideoId) {
    return `https://www.instagram.com/reel/${video.platformVideoId}`
  }
  return video.videoUrl
}

function getThumbnailUrl(video: Video): string | null {
  if (video.thumbnailUrl && URL.canParse(video.thumbnailUrl)) return video.thumbnailUrl
  if (video.platform === 'youtube' && video.platformVideoId) {
    return `https://img.youtube.com/vi/${video.platformVideoId}/hqdefault.jpg`
  }
  return null
}

function getPlatformColor(platform: string): string {
  switch (platform) {
    case 'youtube':
      return 'bg-red-600/20 text-red-400'
    case 'instagram':
      return 'bg-purple-600/20 text-purple-400'
    case 'tiktok':
      return 'bg-zinc-600/20 text-zinc-300'
    default:
      return 'bg-zinc-600/20 text-zinc-400'
  }
}

export function VideoCard({ video, playlistName,playlistColor}: VideoCardProps) {
  const videoUrl = getVideoUrl(video)
  const thumbnailUrl = getThumbnailUrl(video)
  const authorUrl = video.authorUrl && URL.canParse(video.authorUrl) ? video.authorUrl : null

  return (
    <Card className="flex-none w-32 sm:w-36 md:w-40 lg:w-44 snap-start group cursor-pointer hover:bg-zinc-800 transition-all duration-300 shadow-lg hover:shadow-pink-500/20 overflow-hidden">
      <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="block">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video overflow-hidden bg-zinc-800">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={video.title}
              fill
              sizes="(max-width: 640px) 128px, (max-width: 768px) 144px, (max-width: 1024px) 160px, 176px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Play className="w-8 h-8 text-zinc-600" />
            </div>
          )}

          {/* Overlay play */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="w-8 h-8 text-pink-500 fill-pink-500 drop-shadow-lg" />
          </div>
         
        </div>

        {/* Title (dentro del enlace al video) */}
        <div className="px-3 pt-3">
          <h3 className="font-semibold text-white group-hover:text-pink-500 text-sm leading-tight line-clamp-2 transition-colors duration-300">
            {video.title}
          </h3>
        </div>
      </a>

      {/* Info (fuera del <a> principal para poder anidar el enlace del autor) */}
      <div className="px-3 pb-3 pt-1.5 space-y-1.5">
        {video.author && (
          authorUrl ? (
            <a
              href={authorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-zinc-400 hover:text-pink-400 truncate transition-colors"
            >
              <User className="w-3 h-3 shrink-0" />{video.author}
            </a>
          ) : (
            <p className="text-xs text-zinc-400 truncate">{video.author}</p>
          )
        )}
{/* Replace the playlistName block: */}
  {playlistName && (
    <span
      className="inline-block text-xs font-medium px-1.5 py-0.5 rounded truncate max-w-full text-white"
      style={{ backgroundColor: playlistColor ?? '#52525b' }}
    >
      {playlistName}
    </span>
  )}

      </div>
    </Card>
  )
}
