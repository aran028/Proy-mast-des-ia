import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Breadcrumb } from '../breadcrumb'

describe('Breadcrumb', () => {
  it('returns null when items is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders all items in order', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Playlists', href: '/' },
          { label: 'Mi Playlist' },
        ]}
      />
    )
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(3)
    expect(items[0]).toHaveTextContent('Inicio')
    expect(items[1]).toHaveTextContent('Playlists')
    expect(items[2]).toHaveTextContent('Mi Playlist')
  })

  it('renders intermediate items with href as links', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Mi Playlist' },
        ]}
      />
    )
    const link = screen.getByRole('link', { name: 'Inicio' })
    expect(link).toHaveAttribute('href', '/')
  })

  it('marks the last item with aria-current="page" and not as a link', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Inicio', href: '/' },
          { label: 'Final', href: '/final' },
        ]}
      />
    )
    expect(screen.getByText('Final')).toHaveAttribute('aria-current', 'page')
    expect(screen.queryByRole('link', { name: 'Final' })).toBeNull()
  })

  it('wraps everything in a <nav> with aria-label="Breadcrumb"', () => {
    render(<Breadcrumb items={[{ label: 'Solo' }]} />)
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument()
  })
})
