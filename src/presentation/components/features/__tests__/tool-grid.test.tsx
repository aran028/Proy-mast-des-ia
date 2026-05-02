import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ToolGrid } from '../tool-grid'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

const baseTool = (overrides: Partial<Tool>): Tool => ({
  id: 'tool-default',
  name: 'Tool',
  summary: null,
  image: null,
  tags: null,
  website: null,
  supports_prompt: false,
  playlist_id: null,
  created_at: '2026-01-01',
  updated_at: null,
  ...overrides,
})

describe('ToolGrid', () => {
  it('returns null when there are no tools', () => {
    const { container } = render(<ToolGrid tools={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders a card per tool', () => {
    const tools = [
      baseTool({ id: 'a', name: 'A' }),
      baseTool({ id: 'b', name: 'B' }),
    ]
    const { container } = render(<ToolGrid tools={tools} />)
    expect(container.querySelector('#tool-a')).toBeInTheDocument()
    expect(container.querySelector('#tool-b')).toBeInTheDocument()
  })

  it('highlights only the card whose id matches highlightId', () => {
    const tools = [
      baseTool({ id: 'a', name: 'A' }),
      baseTool({ id: 'b', name: 'B' }),
    ]
    const { container } = render(<ToolGrid tools={tools} highlightId="b" />)
    expect(container.querySelector('#tool-a')?.className).not.toContain('ring-pink-500')
    expect(container.querySelector('#tool-b')?.className).toContain('ring-pink-500')
  })

  it('does not highlight any card when highlightId does not match', () => {
    const tools = [baseTool({ id: 'a', name: 'A' })]
    const { container } = render(<ToolGrid tools={tools} highlightId="other" />)
    expect(container.querySelector('#tool-a')?.className).not.toContain('ring-pink-500')
  })
})
