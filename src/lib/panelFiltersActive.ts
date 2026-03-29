import type { DateRangePreset } from '@/store/useFilterStore'

/** Filter dimensions shown in the Library filter panel (excludes search). */
export interface PanelFilterStateSlice {
  datePreset: DateRangePreset
  selectedModels: Set<string>
  starredOnly: boolean
  hasCodeOnly: boolean
  minMessageCount: number
}

/** True when any panel filter differs from its default. */
export function hasActivePanelFilters(s: PanelFilterStateSlice): boolean {
  return activePanelFilterDimensions(s) > 0
}

/**
 * Count of active filter dimensions (date, models, starred, has code, min messages).
 * Used for the filter header badge (1–5).
 */
export function activePanelFilterDimensions(s: PanelFilterStateSlice): number {
  let n = 0
  if (s.datePreset !== 'all') n += 1
  if (s.selectedModels.size > 0) n += 1
  if (s.starredOnly) n += 1
  if (s.hasCodeOnly) n += 1
  if (s.minMessageCount > 0) n += 1
  return n
}
