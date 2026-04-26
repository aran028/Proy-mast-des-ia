'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: Readonly<BreadcrumbProps>) {
  if (items.length === 0) return null

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const key = `${item.label}-${index}`

          return (
            <li key={key} className="flex items-center gap-1.5 min-w-0">
              {index > 0 && (
                <ChevronRight className="size-6 shrink-0 text-pink-500" aria-hidden="true" />
              )}
              {isLast || !item.href ? (
                <span
                  className={`truncate ${isLast ? 'font-bold text-white' : 'font-lg text-pink-500'}`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-zinc-400 hover:text-pink-500 transition-colors truncate"
                >
                  {item.label}                
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
