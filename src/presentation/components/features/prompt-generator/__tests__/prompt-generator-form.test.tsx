import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { PromptGeneratorForm } from '../prompt-generator-form'
import type { Tables } from '@/shared/types/database.types'
import type { GeneratedPrompt } from '@/presentation/hooks/useGeneratePrompt'

type Tool = Tables<'tools'>

type HookState = {
  data: GeneratedPrompt | null
  isLoading: boolean
  error: string | null
}

const generate = vi.fn()
const reset = vi.fn()
let hookState: HookState = { data: null, isLoading: false, error: null }

vi.mock('@/presentation/hooks/useGeneratePrompt', () => ({
  useGeneratePrompt: () => ({ ...hookState, generate, reset }),
}))

const mockTool: Tool = {
  id: 'tool-1',
  name: 'ChatGPT',
  summary: 'AI assistant',
  image: null,
  tags: null,
  website: 'https://chat.openai.com',
  supports_prompt: true,
  playlist_id: 'p1',
  created_at: '2026-01-01',
  updated_at: null,
}

describe('PromptGeneratorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    hookState = { data: null, isLoading: false, error: null }
  })

  it('renders the tool name and the submit button disabled by default', () => {
    render(<PromptGeneratorForm tool={mockTool} />)
    expect(screen.getByText('ChatGPT')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generar/i })).toBeDisabled()
  })

  it('keeps the button disabled while the intent is shorter than 10 chars', () => {
    render(<PromptGeneratorForm tool={mockTool} />)
    const textarea = screen.getByLabelText(/¿para qué quieres el prompt\?/i)
    fireEvent.change(textarea, { target: { value: 'corto' } })
    expect(screen.getByRole('button', { name: /generar/i })).toBeDisabled()
  })

  it('calls generate with toolId and trimmed intent on submit', async () => {
    render(<PromptGeneratorForm tool={mockTool} />)
    const textarea = screen.getByLabelText(/¿para qué quieres el prompt\?/i)
    fireEvent.change(textarea, {
      target: { value: '   un email profesional para un reembolso   ' },
    })

    const button = screen.getByRole('button', { name: /generar/i })
    expect(button).toBeEnabled()
    fireEvent.click(button)

    await waitFor(() => {
      expect(generate).toHaveBeenCalledWith({
        toolId: 'tool-1',
        userIntent: 'un email profesional para un reembolso',
      })
    })
  })

  it('shows the loading state when isLoading is true', () => {
    hookState = { data: null, isLoading: true, error: null }
    render(<PromptGeneratorForm tool={mockTool} />)
    expect(screen.getByText(/generando/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generando/i })).toBeDisabled()
  })

  it('renders the error message when the hook reports one', () => {
    hookState = { data: null, isLoading: false, error: 'Tool not prompt-enabled' }
    render(<PromptGeneratorForm tool={mockTool} />)
    expect(screen.getByText('Tool not prompt-enabled')).toBeInTheDocument()
  })

  it('renders the generated prompt and an external link to the tool website', () => {
    hookState = {
      data: {
        prompt: 'Tu prompt generado',
        model: 'claude-sonnet-4-5',
        toolName: 'ChatGPT',
        toolWebsite: 'https://chat.openai.com',
      },
      isLoading: false,
      error: null,
    }
    render(<PromptGeneratorForm tool={mockTool} />)

    expect(screen.getByText('Tu prompt generado')).toBeInTheDocument()
    expect(screen.getByText('claude-sonnet-4-5')).toBeInTheDocument()

    const link = screen.getByRole('link', { name: /probar en chatgpt/i })
    expect(link).toHaveAttribute('href', 'https://chat.openai.com')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('copies the generated prompt to the clipboard when Copy is clicked', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })

    hookState = {
      data: {
        prompt: 'Texto a copiar',
        model: 'claude-sonnet-4-5',
        toolName: 'ChatGPT',
        toolWebsite: null,
      },
      isLoading: false,
      error: null,
    }
    render(<PromptGeneratorForm tool={mockTool} />)

    fireEvent.click(screen.getByRole('button', { name: /copiar/i }))

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('Texto a copiar')
    })
    expect(await screen.findByText(/copiado/i)).toBeInTheDocument()
  })
})
