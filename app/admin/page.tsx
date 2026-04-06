import Link from 'next/link'

export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-8">Panel de administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { href: '/admin/playlists', label: 'Playlists', desc: 'Gestionar categorías' },
          { href: '/admin/tools', label: 'Tools', desc: 'Gestionar herramientas' },
          { href: '/admin/practices', label: 'Practices', desc: 'Gestionar prácticas' },
        ].map(({ href, label, desc }) => (
          <Link key={href} href={href}
            className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-600 transition-colors">
            <h2 className="text-white font-semibold text-lg">{label}</h2>
            <p className="text-zinc-400 text-sm mt-1">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
