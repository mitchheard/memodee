import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FilterPanel } from './FilterPanel'
import { useFilterStore } from '@/store/useFilterStore'

vi.mock('@/hooks/useConversations', () => ({
  useConversations: () => ({ conversations: [], isLoading: false }),
}))

describe('FilterPanel', () => {
  beforeEach(() => {
    useFilterStore.setState({
      filtersPanelExpanded: false,
      datePreset: 'all',
      selectedModels: new Set(),
      starredOnly: false,
      hasCodeOnly: false,
      minMessageCount: 0,
    })
  })

  it('starts collapsed so filter controls are not visible', () => {
    render(<FilterPanel />)
    expect(screen.getByRole('button', { name: 'Filters' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.queryByRole('button', { name: 'Last 30 days' })).not.toBeInTheDocument()
  })

  it('toggles open when the Filters header is clicked', () => {
    render(<FilterPanel />)
    const trigger = screen.getByRole('button', { name: 'Filters' })
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Last 30 days' })).toBeInTheDocument()
    fireEvent.click(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows a numeric badge when panel filters are active while collapsed', () => {
    useFilterStore.setState({ datePreset: '30d' })
    render(<FilterPanel />)
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Filters, 1 active/ })).toBeInTheDocument()
  })

  it('keeps filter values when collapsing after a change', () => {
    render(<FilterPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }))
    fireEvent.click(screen.getByRole('button', { name: 'Last 30 days' }))
    expect(useFilterStore.getState().datePreset).toBe('30d')
    fireEvent.click(screen.getByRole('button', { name: /Filters, 1 active/ }))
    expect(useFilterStore.getState().datePreset).toBe('30d')
    expect(screen.queryByRole('button', { name: 'Last 30 days' })).not.toBeInTheDocument()
  })
})
