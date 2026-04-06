import Link from 'next/link'
import { createRepositories } from '@/infrastructure/config/repository.factory'
import { GetAllPracticesUseCase } from '@/application/use-cases/practice'
import { GetAllPlaylistsUseCase } from '@/application/use-cases/playlist'
import { GetAllToolsUseCase } from '@/application/use-cases/tool'
import DeleteButton from '@/presentation/components/admin/DeleteButton'

export default async function AdminPracticesPage() {
  const { practice, playlist, tool } = await createRepositories()
  
  const [practices, playlists, tools] = await Promise.all([
    new GetAllPracticesUseCase(practice).execute(),
    new GetAllPlaylistsUseCase(playlist).execute(),
    new GetAllToolsUseCase(tool).execute(),
  ])

  // Crear mapas para búsqueda rápida
  const playlistMap = new Map(playlists.map(p => [p.id, p.name]))
  const toolMap = new Map(tools.map(t => [t.id, t.name]))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-white">Practices</h1>
        <Link href="/admin/practices/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-2 rounded-md">
          + Nueva práctica
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-800">
            <tr>
              <th className="text-left text-zinc-400 px-4 py-3">Título</th>
              <th className="text-left text-zinc-400 px-4 py-3">Tipo</th>
              <th className="text-left text-zinc-400 px-4 py-3">Playlist</th>
              <th className="text-left text-zinc-400 px-4 py-3">Tool</th>
              <th className="text-left text-zinc-400 px-4 py-3">Descripción</th>
              <th className="text-right text-zinc-400 px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {practices.map(p => (
              <tr key={p.id} className="border-b border-zinc-800 last:border-0">
                <td className="text-white px-4 py-3">{p.title}</td>
                <td className="text-zinc-400 px-4 py-3">
                  {p.type ? (
                    <span className="inline-block bg-zinc-800 px-2 py-1 rounded text-xs">
                      {p.type}
                    </span>
                  ) : '—'}
                </td>
                <td className="text-zinc-400 px-4 py-3">
                  {p.playlist_id ? playlistMap.get(p.playlist_id) || '—' : '—'}
                </td>
                <td className="text-zinc-400 px-4 py-3">
                  {p.tool_id ? toolMap.get(p.tool_id) || '—' : '—'}
                </td>
                <td className="text-zinc-400 px-4 py-3 max-w-xs truncate">
                  {p.description || '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-4">
                    <Link href={`/admin/practices/${p.id}/edit`}
                      className="text-indigo-400 hover:text-indigo-300">Editar</Link>
                    <DeleteButton url={`/api/admin/practices/${p.id}`} />
                  </div>
                </td>
              </tr>
            ))}
            {practices.length === 0 && (
              <tr><td colSpan={6} className="text-zinc-500 px-4 py-6 text-center">No hay prácticas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
