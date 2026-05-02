'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Library, Toolbox, Video, FileText, type LucideIcon } from 'lucide-react'

type NavLink = {
  name: string
  href: string
  icon: LucideIcon
}

const navLinks: NavLink[] = [
  { name: 'Playlists', href: '/admin/playlists', icon: Library },
  { name: 'Tools', href: '/admin/tools', icon: Toolbox },
  { name: 'Videos', href: '/admin/videos', icon: Video },
  { name: 'Documentos', href: '/admin/documents', icon: FileText },
]

export function AdminNavLinks() {
  const pathname = usePathname()

  return (
    <div className="flex items-center gap-4">
      {navLinks.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive ? 'page' : undefined}
            className={`text-md font-medium transition-colors flex items-center gap-2 ${
              isActive
                ? 'text-pink-500'
                : 'text-zinc-400 hover:text-pink-500'
            }`}
          >
            <link.icon className="size-6" />
            {link.name}
          </Link>
        )
      })}
    </div>
  )
}
