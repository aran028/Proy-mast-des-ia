// Server Component — los datos se cargan en el servidor sin exponer lógica al cliente
import Link from 'next/link'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { GetAllPlaylistsUseCase } from '@/application/use-cases/playlist'
import DeleteButton from '@/presentation/components/admin/DeleteButton'

export default async function AdminPlaylistsPage() {
  const { playlist } = await createRepositories()
  const playlists = await new GetAllPlaylistsUseCase(playlist).execute()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Playlists</h1>
        <Link href="/admin/playlists/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md">
          + Nueva playlist
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left text-zinc-400 px-4 py-3">Nombre</th>
              <th className="text-left text-zinc-400 px-4 py-3">Descripción</th>
              <th className="text-right text-zinc-400 px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {playlists.map(p => (
              <tr key={p.id} className="border-b border-zinc-800 last:border-0">
                <td className="text-white px-4 py-3">{p.icon} {p.name}</td>
                <td className="text-zinc-400 px-4 py-3">{p.description || '—'}</td>
                <td className="px-4 py-3 text-right flex items-center justify-end gap-4">
                  <Link href={`/admin/playlists/${p.id}/edit`}
                    className="text-indigo-400 hover:text-indigo-300">Editar</Link>
                  {/* DeleteButton es Client Component para manejar el confirm y el fetch DELETE */}
                  <DeleteButton url={`/api/admin/playlists/${p.id}`} />
                </td>
              </tr>
            ))}
            {playlists.length === 0 && (
              <tr><td colSpan={3} className="text-zinc-500 px-4 py-6 text-center">No hay playlists</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
