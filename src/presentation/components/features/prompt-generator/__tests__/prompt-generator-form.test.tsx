import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PromptGeneratorForm } from '../prompt-generator-form'
import type { Tables } from '@/shared/types/database.types'

type Tool = Tables<'tools'>

const mockTool = {
  id: 'tool-1',
  name: 'ChatGPT',
  summary: 'AI assistant',
  image: null,
  tags: null,
  website: 'https://chat.openai.com',
  supports_prompt: true,
  playlist_id: null,
  user_id: null,
  created_at: '2024-01-01',
} as Tool

describe('PromptGeneratorForm', () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) }
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('renders the tool name and form', () => {
    render(<PromptGeneratorForm tool={mockTool} />)
    expect(screen.getByText(/ChatGPT/)).toBeInTheDocument()
    expect(screen.getByLabelText(/para qué quieres el prompt/i)).toBeInTheDocument()
  })

  it('disables the submit button until intent is long enough', () => {
    render(<PromptGeneratorForm tool={mockTool} />)
    const button = screen.getByRole('button', { name: /generar/i })
    expect(button).toBeDisabled()

    const textarea = screen.getByLabelText(/para qué quieres el prompt/i)
    fireEvent.change(textarea, { target: { value: 'too short' } })
    expect(button).toBeDisabled()

    fireEvent.change(textarea, { target: { value: 'this is a long enough intent to be valid' } })
    expect(button).not.toBeDisabled()
  })

  it('submits and renders the generated prompt with copy button', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          prompt: 'Generated prompt content',
          model: 'claude-sonnet-4-5',
          toolName: 'ChatGPT',
          toolWebsite: 'https://chat.openai.com',
        },
      }),
    })

    render(<PromptGeneratorForm tool={mockTool} />)
    fireEvent.change(screen.getByLabelText(/para qué quieres el prompt/i), {
      target: { value: 'Write a short story about a lonely robot' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generar/i }))

    await waitFor(() => {
      expect(screen.getByText('Generated prompt content')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /copiar/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Generated prompt content')
    })
    expect(await screen.findByText(/copiado/i)).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /probar en chatgpt/i })
    expect(link).toHaveAttribute('href', 'https://chat.openai.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows an error message when the API fails', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      json: async () => ({ success: false, error: 'Tool does not support prompt' }),
    })

    render(<PromptGeneratorForm tool={mockTool} />)
    fireEvent.change(screen.getByLabelText(/para qué quieres el prompt/i), {
      target: { value: 'This is a valid intent string' },
    })
    fireEvent.click(screen.getByRole('button', { name: /generar/i }))

    expect(await screen.findByText(/tool does not support prompt/i)).toBeInTheDocument()
  })
})
