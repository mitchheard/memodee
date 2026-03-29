import { describe, it, expect } from 'vitest'
import {
  getHeatmapCellColor,
  getHeatmapLegendSwatches,
  truncateChartLabel,
  formatModelUsagePercent,
} from './analyticsCharts'

describe('getHeatmapCellColor', () => {
  it('returns distinct empty colors for light and dark', () => {
    expect(getHeatmapCellColor(0, 100, 'light')).toMatch(/^#/)
    expect(getHeatmapCellColor(0, 100, 'dark')).toMatch(/^#/)
    expect(getHeatmapCellColor(0, 100, 'light')).not.toBe(
      getHeatmapCellColor(0, 100, 'dark')
    )
  })

  it('returns a green level for active counts', () => {
    const c = getHeatmapCellColor(50, 100, 'dark')
    expect(c).toMatch(/^#/)
    expect(c).not.toBe(getHeatmapCellColor(0, 100, 'dark'))
  })

  it('ramps intensity with share of max', () => {
    const low = getHeatmapCellColor(1, 100, 'light')
    const high = getHeatmapCellColor(100, 100, 'light')
    expect(low).not.toBe(high)
  })
})

describe('getHeatmapLegendSwatches', () => {
  it('returns empty plus four levels for each theme', () => {
    expect(getHeatmapLegendSwatches('light')).toHaveLength(5)
    expect(getHeatmapLegendSwatches('dark')).toHaveLength(5)
    expect(getHeatmapLegendSwatches('light')[0]).toBe(getHeatmapCellColor(0, 100, 'light'))
    expect(getHeatmapLegendSwatches('dark')[0]).toBe(getHeatmapCellColor(0, 100, 'dark'))
  })
})

describe('truncateChartLabel', () => {
  it('leaves short strings unchanged', () => {
    expect(truncateChartLabel('Hi', 10)).toBe('Hi')
  })

  it('truncates with ellipsis', () => {
    const s = 'a'.repeat(40)
    const out = truncateChartLabel(s, 10)
    expect(out.length).toBe(10)
    expect(out.endsWith('…')).toBe(true)
  })
})

describe('formatModelUsagePercent', () => {
  it('formats share of total', () => {
    expect(formatModelUsagePercent(25, 100)).toBe('25.0%')
  })

  it('handles zero total', () => {
    expect(formatModelUsagePercent(5, 0)).toBe('0%')
  })
})
