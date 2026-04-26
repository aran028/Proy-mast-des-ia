import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ToolCard } from '../tool-card'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

const mockTool: Tool = {
  id: 'tool-1',
  name: 'ChatGPT',
  summary: 'AI assistant',
  image: null,
  tags: null,
  website: 'https://chat.openai.com',
  supports_prompt: true,
  playlist_id: 'p1',
  user_id: null,
  created_at: '2026-01-01',
  updated_at: null,
}

describe('ToolCard', () => {
  it('renders the tool name and summary', () => {
    render(<ToolCard tool={mockTool} />)
    expect(screen.getAllByText('ChatGPT').length).toBeGreaterThan(0)
    expect(screen.getAllByText('AI assistant').length).toBeGreaterThan(0)
  })

  it('exposes id "tool-{id}" for scroll anchoring', () => {
    const { container } = render(<ToolCard tool={mockTool} />)
    expect(container.querySelector('#tool-tool-1')).toBeInTheDocument()
  })

  it('does not include the highlight ring class by default', () => {
    const { container } = render(<ToolCard tool={mockTool} />)
    const card = container.querySelector('#tool-tool-1')
    expect(card?.className).not.toContain('ring-pink-500')
  })

  it('includes the highlight ring class when isHighlighted is true', () => {
    const { container } = render(<ToolCard tool={mockTool} isHighlighted />)
    const card = container.querySelector('#tool-tool-1')
    expect(card?.className).toContain('ring-pink-500')
    expect(card?.className).toContain('ring-2')
  })
})
