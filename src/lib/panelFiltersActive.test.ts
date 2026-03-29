import { describe, it, expect } from 'vitest'
import {
  activePanelFilterDimensions,
  hasActivePanelFilters,
} from './panelFiltersActive'

function slice(over: Partial<Parameters<typeof hasActivePanelFilters>[0]> = {}) {
  return {
    datePreset: 'all' as const,
    selectedModels: new Set<string>(),
    starredOnly: false,
    hasCodeOnly: false,
    minMessageCount: 0,
    ...over,
  }
}

describe('panelFiltersActive', () => {
  it('is inactive when all panel filters are default', () => {
    expect(hasActivePanelFilters(slice())).toBe(false)
    expect(activePanelFilterDimensions(slice())).toBe(0)
  })

  it('counts date preset when not all', () => {
    expect(hasActivePanelFilters(slice({ datePreset: '30d' }))).toBe(true)
    expect(activePanelFilterDimensions(slice({ datePreset: '30d' }))).toBe(1)
  })

  it('counts selected models as one dimension regardless of how many labels', () => {
    const s = slice({ selectedModels: new Set(['A', 'B']) })
    expect(activePanelFilterDimensions(s)).toBe(1)
  })

  it('sums independent dimensions', () => {
    expect(
      activePanelFilterDimensions(
        slice({
          datePreset: '6m',
          selectedModels: new Set(['x']),
          starredOnly: true,
          hasCodeOnly: true,
          minMessageCount: 3,
        })
      )
    ).toBe(5)
  })
})
