import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Tables } from '@/shared/types/database.types'

const mocks = vi.hoisted(() => ({
  useToolsMock: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

vi.mock('@/presentation/hooks', () => ({
  useTools: () => mocks.useToolsMock(),
}))

import { Sidebar } from '../sidebar'

type Playlist = Tables<'playlists'>
type Tool = Tables<'tools'>

const mockPlaylists: Playlist[] = [
  {
    id: 'p1',
    name: 'IA Generativa',
    icon: 'brain',
    color: null,
    description: null,
    user_id: null,
    created_at: '2026-01-01',
    updated_at: null,
  },
  {
    id: 'p2',
    name: 'DevOps',
    icon: 'devops',
    color: null,
    description: null,
    user_id: null,
    created_at: '2026-01-01',
    updated_at: null,
  },
]

const mockTools: Tool[] = [
  {
    id: 't1',
    name: 'ChatGPT',
    summary: null,
    image: null,
    tags: null,
    website: null,
    supports_prompt: true,
    playlist_id: 'p1',
    user_id: null,
    created_at: '2026-01-01',
    updated_at: null,
  },
  {
    id: 't2',
    name: 'Docker',
    summary: null,
    image: null,
    tags: null,
    website: null,
    supports_prompt: false,
    playlist_id: 'p2',
    user_id: null,
    created_at: '2026-01-01',
    updated_at: null,
  },
]

describe('Sidebar', () => {
  beforeEach(() => {
    mocks.useToolsMock.mockReturnValue({ tools: mockTools, loading: false, error: null })
  })

  it('shows the playlists view by default', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    expect(screen.getByRole('link', { name: 'IA Generativa' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'DevOps' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'ChatGPT' })).toBeNull()
  })

  it('switches to tools view when the Tools tab is clicked', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    fireEvent.click(screen.getByRole('tab', { name: /tools/i }))
    expect(screen.getByRole('link', { name: 'ChatGPT' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Docker' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'IA Generativa' })).toBeNull()
  })

  it('changes the search input placeholder according to the active tab', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    expect(screen.getByPlaceholderText('Buscar en playlists')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: /tools/i }))
    expect(screen.getByPlaceholderText('Buscar en tools')).toBeInTheDocument()
  })

  it('filters playlists by name', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    const input = screen.getByPlaceholderText('Buscar en playlists')
    fireEvent.change(input, { target: { value: 'devops' } })
    expect(screen.getByRole('link', { name: 'DevOps' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'IA Generativa' })).toBeNull()
  })

  it('filters tools by name and shows "Sin resultados" when nothing matches', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    fireEvent.click(screen.getByRole('tab', { name: /tools/i }))

    const input = screen.getByPlaceholderText('Buscar en tools')
    fireEvent.change(input, { target: { value: 'chat' } })
    expect(screen.getByRole('link', { name: 'ChatGPT' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Docker' })).toBeNull()

    fireEvent.change(input, { target: { value: 'xxxnotfoundxxx' } })
    expect(screen.getByText('Sin resultados')).toBeInTheDocument()
  })

  it('resets the filter query when switching tabs', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    const playlistsInput = screen.getByPlaceholderText('Buscar en playlists') as HTMLInputElement
    fireEvent.change(playlistsInput, { target: { value: 'devops' } })
    expect(playlistsInput.value).toBe('devops')

    fireEvent.click(screen.getByRole('tab', { name: /tools/i }))
    const toolsInput = screen.getByPlaceholderText('Buscar en tools') as HTMLInputElement
    expect(toolsInput.value).toBe('')
  })

  it('builds tool href as /?playlist=<id>&highlight=<toolId>', () => {
    render(<Sidebar playlists={mockPlaylists} />)
    fireEvent.click(screen.getByRole('tab', { name: /tools/i }))
    const link = screen.getByRole('link', { name: 'ChatGPT' })
    expect(link).toHaveAttribute('href', '/?playlist=p1&highlight=t1')
  })
})
