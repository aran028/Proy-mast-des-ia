import { notFound } from 'next/navigation'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import EditVideoForm from './EditVideoForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditVideoPage({ params }: Props) {
  const { id } = await params
  const { video } = await createRepositories()
  const data = await video.findById(id)

  if (!data) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Editar video</h1>
      <EditVideoForm video={data} />
    </div>
  )
}
