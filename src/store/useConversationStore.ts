import { create } from 'zustand'

interface ConversationStore {
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  selectedIds: Set<string>
  toggleSelection: (id: string) => void
  clearSelection: () => void
}

export const useConversationStore = create<ConversationStore>((set) => ({
  activeConversationId: null,
  setActiveConversationId: (id) => set({ activeConversationId: id }),
  selectedIds: new Set(),
  toggleSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedIds: next }
    }),
  clearSelection: () => set({ selectedIds: new Set() }),
}))
