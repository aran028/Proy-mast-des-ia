import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Footer } from '../footer'

describe('Footer', () => {
  it('renders the GitHub project link with proper href and target', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /master de desarrollo/i })
    expect(link).toHaveAttribute('href', 'https://github.com/aran028/Proy-mast-des-ia')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link.getAttribute('rel')).toContain('noopener')
    expect(link.getAttribute('rel')).toContain('noreferrer')
  })

  it('renders the GitHub avatar with src and alt', () => {
    render(<Footer />)
    const avatar = screen.getByAltText(/aran028 en github/i)
    expect(avatar).toHaveAttribute('src', 'https://github.com/aran028.png')
  })

  it('renders the Big School link in a new tab', () => {
    render(<Footer />)
    const link = screen.getByRole('link', { name: /big school/i })
    expect(link).toHaveAttribute('href', 'https://thebigschool.com/')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders the copyright', () => {
    render(<Footer />)
    expect(screen.getByText(/© 2026 Aranzazu Foronda/)).toBeInTheDocument()
  })
})
