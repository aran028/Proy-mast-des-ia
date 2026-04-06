// Página de edición — Server Component que carga los datos actuales de la playlist
// y los pasa al formulario cliente
import { notFound } from 'next/navigation'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import EditPlaylistForm from './EditPlaylistForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPlaylistPage({ params }: Props) {
  const { id } = await params

  // Cargamos la playlist desde la BD para pre-rellenar el formulario
  const { playlist } = await createRepositories()
  const data = await playlist.findById(id)

  // Si no existe, mostramos 404
  if (!data) notFound()

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold text-white mb-6">Editar playlist</h1>
      <EditPlaylistForm playlist={data} />
    </div>
  )
}
