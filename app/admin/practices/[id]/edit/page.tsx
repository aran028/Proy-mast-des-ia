import { notFound } from 'next/navigation'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import EditPracticeForm from './EditPracticeForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPracticePage({ params }: Props) {
  const { id } = await params
  const { practice } = await createRepositories()
  const data = await practice.findById(id)

  if (!data) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Editar práctica</h1>
      <EditPracticeForm practice={data} />
    </div>
  )
}
