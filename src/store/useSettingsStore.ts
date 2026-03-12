import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const STORAGE_KEY = 'chatgpt-archive-settings'

interface SettingsState {
  openAIKey: string
  notionToken: string
  notionDatabaseId: string
  defaultExportFormat: 'markdown' | 'pdf' | 'obsidian'
  theme: 'light' | 'dark' | 'system'

  setOpenAIKey: (v: string) => void
  setNotionToken: (v: string) => void
  setNotionDatabaseId: (v: string) => void
  setDefaultExportFormat: (v: 'markdown' | 'pdf' | 'obsidian') => void
  setTheme: (v: 'light' | 'dark' | 'system') => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      openAIKey: '',
      notionToken: '',
      notionDatabaseId: '',
      defaultExportFormat: 'markdown',
      theme: 'system',

      setOpenAIKey: (v) => set({ openAIKey: v }),
      setNotionToken: (v) => set({ notionToken: v }),
      setNotionDatabaseId: (v) => set({ notionDatabaseId: v }),
      setDefaultExportFormat: (v) => set({ defaultExportFormat: v }),
      setTheme: (v) => set({ theme: v }),
    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        openAIKey: s.openAIKey,
        notionToken: s.notionToken,
        notionDatabaseId: s.notionDatabaseId,
        defaultExportFormat: s.defaultExportFormat,
        theme: s.theme,
      }),
    }
  )
)
