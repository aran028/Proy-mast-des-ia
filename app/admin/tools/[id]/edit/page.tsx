import { notFound } from 'next/navigation'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import EditToolForm from './EditToolForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditToolPage({ params }: Props) {
  const { id } = await params
  const { tool } = await createRepositories()
  const data = await tool.findById(id)

  if (!data) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Editar tool</h1>
      <EditToolForm tool={data} />
    </div>
  )
}
