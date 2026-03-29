/** GitHub-style contribution colors — tuned for light UI backgrounds. */
const HEATMAP_EMPTY_LIGHT = '#ebedf0'
const HEATMAP_LEVELS_LIGHT = ['#9be9a8', '#40c463', '#30a14e', '#216e39'] as const

/** Dark mode: empty cells sit above page bg; active greens read clearly. */
const HEATMAP_EMPTY_DARK = '#30363d'
const HEATMAP_LEVELS_DARK = ['#0e4429', '#006d32', '#26a641', '#39d353'] as const

/**
 * Background for a heatmap cell. Empty cells use a neutral that contrasts with
 * card background in both themes; active cells use a green intensity ramp.
 */
export function getHeatmapCellColor(
  count: number,
  max: number,
  theme: 'light' | 'dark'
): string {
  if (count <= 0) {
    return theme === 'dark' ? HEATMAP_EMPTY_DARK : HEATMAP_EMPTY_LIGHT
  }
  const t = max > 0 ? Math.min(1, count / max) : 1
  const levels = theme === 'dark' ? HEATMAP_LEVELS_DARK : HEATMAP_LEVELS_LIGHT
  const idx = Math.min(levels.length - 1, Math.floor(t * levels.length))
  return levels[idx]!
}

/** Border so empty cells remain visible against `--card` in dark mode. */
export function getHeatmapCellBorder(theme: 'light' | 'dark'): string {
  return theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'
}

/** Swatches for the activity heatmap legend: no messages, then low → high (same ramp as cells). */
export function getHeatmapLegendSwatches(theme: 'light' | 'dark'): string[] {
  const empty = theme === 'dark' ? HEATMAP_EMPTY_DARK : HEATMAP_EMPTY_LIGHT
  const levels = theme === 'dark' ? HEATMAP_LEVELS_DARK : HEATMAP_LEVELS_LIGHT
  return [empty, ...levels]
}

export function truncateChartLabel(text: string, maxChars: number): string {
  const t = text.trim()
  if (t.length <= maxChars) return t
  return `${t.slice(0, Math.max(0, maxChars - 1))}…`
}

export function formatModelUsagePercent(value: number, total: number): string {
  if (total <= 0) return '0%'
  return `${((value / total) * 100).toFixed(1)}%`
}
