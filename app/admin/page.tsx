import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-pink-500 mb-8">Panel de administración</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { href: '/admin/playlists', label: 'Playlists', desc: 'Gestionar categorías' },
          { href: '/admin/tools', label: 'Tools', desc: 'Gestionar herramientas' },
          { href: '/admin/videos', label: 'Videos', desc: 'Gestionar videos' }
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-pink-600 transition-colors">
            <h2 className="text-pink-500 font-semibold text-lg">{label}</h2>
            <p className="text-zinc-500 text-sm mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
