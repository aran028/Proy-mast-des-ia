'use client'

import { Play, Clock, Eye } from 'lucide-react'
import { Card } from '../ui/card'
import { Badge } from '../ui/badge'
import Image from 'next/image'
import type { Video } from '@/presentation/hooks/useVideos'

interface VideoCardProps {
  video: Video
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return ''
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatViews(views: number | null): string {
  if (views == null) return ''
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`
  return views.toString()
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

export function VideoCard({ video }: VideoCardProps) {
  const videoUrl = getVideoUrl(video)
  const thumbnailUrl = getThumbnailUrl(video)

  return (
    <Card className="flex-none w-32 sm:w-36 md:w-40 lg:w-44 snap-start group cursor-pointer hover:bg-zinc-800 transition-all duration-300 shadow-lg hover:shadow-pink-500/20 overflow-hidden">
      <a href={videoUrl} target="_blank" rel="noopener noreferrer">
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

          {/* Duration badge */}
          {video.duration != null && (
            <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Clock className="w-2.5 h-2.5" />
              {formatDuration(video.duration)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 space-y-1.5">
          <h3 className="font-semibold text-white group-hover:text-pink-500 text-sm leading-tight line-clamp-2 transition-colors duration-300">
            {video.title}
          </h3>

          {video.author && (
            <p className="text-xs text-zinc-400 truncate">{video.author}</p>
          )}

          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            {video.viewCount != null && (
              <span className="flex items-center gap-0.5">
                <Eye className="w-2.5 h-2.5" />
                {formatViews(video.viewCount)}
              </span>
            )}
 
          </div>

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {video.tags.slice(0, 2).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 bg-[#0a0a0a] text-zinc-400 group-hover:text-pink-400 transition-colors duration-300"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </a>
    </Card>
  )
}
