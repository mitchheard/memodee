import { create } from 'zustand'

export type DateRangePreset = 'all' | '30d' | '6m' | 'year'

export interface FilterStore {
  searchQuery: string
  setSearchQuery: (q: string) => void

  datePreset: DateRangePreset
  setDatePreset: (p: DateRangePreset) => void

  selectedModels: Set<string>
  toggleModel: (model: string) => void
  clearModels: () => void

  starredOnly: boolean
  setStarredOnly: (v: boolean) => void

  hasCodeOnly: boolean
  setHasCodeOnly: (v: boolean) => void

  minMessageCount: number
  setMinMessageCount: (n: number) => void
}

export const useFilterStore = create<FilterStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),

  datePreset: 'all',
  setDatePreset: (p) => set({ datePreset: p }),

  selectedModels: new Set(),
  toggleModel: (model) =>
    set((s) => {
      const next = new Set(s.selectedModels)
      if (next.has(model)) next.delete(model)
      else next.add(model)
      return { selectedModels: next }
    }),
  clearModels: () => set({ selectedModels: new Set() }),

  starredOnly: false,
  setStarredOnly: (v) => set({ starredOnly: v }),

  hasCodeOnly: false,
  setHasCodeOnly: (v) => set({ hasCodeOnly: v }),

  minMessageCount: 0,
  setMinMessageCount: (n) => set({ minMessageCount: Math.max(0, n) }),
}))
