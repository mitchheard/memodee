import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Navbar } from '@/components/layout/Navbar'
import { Home } from '@/pages/Home'
import { DropZone } from '@/components/import/DropZone'

vi.mock('@/hooks/useImport', () => ({
  useImport: () => ({
    importFile: vi.fn(),
    progress: { stage: 'idle' as const },
    error: null,
    reset: vi.fn(),
  }),
}))

describe('AVIDX-90 branding', () => {
  it('Navbar shows Import as the home page title', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Navbar />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Import')
  })

  it('Home page shows Import heading and LLM-agnostic subtitle', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    )
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Import')
    expect(
      screen.getByText('Browse and search your AI conversation history.')
    ).toBeInTheDocument()
  })

  it('DropZone describes generic JSON support', () => {
    render(<DropZone onFile={() => {}} />)
    expect(screen.getByText(/supports/i)).toBeInTheDocument()
    expect(screen.getByText(/conversations\.json/)).toBeInTheDocument()
    expect(screen.getByText(/similar\s+formats/i)).toBeInTheDocument()
  })
})
