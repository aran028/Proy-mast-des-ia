import { notFound } from 'next/navigation'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import EditVideoForm from './EditVideoForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditVideoPage({ params }: Readonly<Props>) {
  const { id } = await params
  const { video } = await createRepositories()
  const data = await video.findById(id)

  if (!data) notFound()

  // Convert domain entity instance to plain object for Client Component props.
  const plainVideo = {
    id: data.id,
    title: data.title,
    description: data.description,
    videoUrl: data.videoUrl,
    platformVideoId: data.platformVideoId,
    platform: data.platform,
    thumbnailUrl: data.thumbnailUrl,
    author: data.author,
    authorUrl: data.authorUrl,
    duration: data.duration,
    viewCount: data.viewCount,
    publishedAt: data.publishedAt,
    tags: data.tags,
    playlistId: data.playlistId,
    toolId: data.toolId,
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-pink-400 mb-6">Editar video</h1>
      <EditVideoForm video={plainVideo} />
    </div>
  )
}
