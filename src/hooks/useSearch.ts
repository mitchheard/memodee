import { useMemo, useState, useEffect } from 'react'
import { useConversations } from '@/hooks/useConversations'
import { useFilterStore } from '@/store/useFilterStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useEmbeddingIndex } from '@/hooks/useEmbeddingIndex'
import { useSemanticSearch } from '@/hooks/useSemanticSearch'
import {
  buildSearchIndex,
  searchConversations,
  type SearchResult,
} from '@/lib/search'
import type { Conversation } from '@/types'

const DEBOUNCE_MS = 150

function applyFilters(
  conversations: Conversation[],
  filters: {
    datePreset: string
    selectedModels: Set<string>
    starredOnly: boolean
    hasCodeOnly: boolean
    minMessageCount: number
  }
): Conversation[] {
  let list = conversations

  if (filters.datePreset !== 'all') {
    const now = Date.now()
    const cut =
      filters.datePreset === '30d'
        ? 30 * 24 * 60 * 60 * 1000
        : filters.datePreset === '6m'
          ? 180 * 24 * 60 * 60 * 1000
          : 365 * 24 * 60 * 60 * 1000
    const cutOff = new Date(now - cut)
    list = list.filter((c) => new Date(c.updatedAt).getTime() >= cutOff.getTime())
  }

  if (filters.selectedModels.size > 0) {
    list = list.filter((c) => filters.selectedModels.has(c.model))
  }

  if (filters.starredOnly) {
    list = list.filter((c) => c.isStarred)
  }

  if (filters.hasCodeOnly) {
    list = list.filter((c) => c.hasCode === true)
  }

  if (filters.minMessageCount > 0) {
    list = list.filter((c) => c.messageCount >= filters.minMessageCount)
  }

  return list
}

export function useSearch(): {
  conversations: Conversation[]
  searchResults: Map<string, SearchResult>
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchMode: 'fuzzy' | 'semantic'
  setSearchMode: (m: 'fuzzy' | 'semantic') => void
  needIndexing: boolean
  isIndexing: boolean
  indexProgress: { current: number; total: number } | null
  startIndexing: (apiKey: string) => Promise<void>
} {
  const { conversations: allConversations, isLoading } = useConversations()
  const searchQuery = useFilterStore((s) => s.searchQuery)
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery)
  const searchMode = useFilterStore((s) => s.searchMode)
  const setSearchMode = useFilterStore((s) => s.setSearchMode)
  const openAIKey = useSettingsStore((s) => s.openAIKey)
  const datePreset = useFilterStore((s) => s.datePreset)
  const selectedModels = useFilterStore((s) => s.selectedModels)
  const starredOnly = useFilterStore((s) => s.starredOnly)
  const hasCodeOnly = useFilterStore((s) => s.hasCodeOnly)
  const minMessageCount = useFilterStore((s) => s.minMessageCount)

  const { needIndexing, isIndexing, indexProgress, startIndexing } = useEmbeddingIndex(allConversations)
  const { conversations: semanticConversations, isLoading: semanticLoading } = useSemanticSearch(
    searchQuery,
    searchMode === 'semantic' && !!openAIKey?.trim() && !needIndexing && !isIndexing,
    openAIKey ?? ''
  )

  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery), DEBOUNCE_MS)
    return () => clearTimeout(t)
  }, [searchQuery])

  const fuseIndex = useMemo(
    () => buildSearchIndex(allConversations),
    [allConversations]
  )

  const conversationsById = useMemo(() => {
    const m = new Map<string, Conversation>()
    for (const c of allConversations) m.set(c.id, c)
    return m
  }, [allConversations])

  const searchResults = useMemo(() => {
    const results = searchConversations(fuseIndex, debouncedQuery, conversationsById)
    const m = new Map<string, SearchResult>()
    for (const r of results) m.set(r.conversation.id, r)
    return m
  }, [fuseIndex, debouncedQuery, conversationsById])

  const afterSearch = useMemo(() => {
    if (searchMode === 'semantic' && openAIKey?.trim() && !needIndexing && !isIndexing) {
      if (!searchQuery.trim()) return allConversations
      return semanticConversations
    }
    // Fuzzy path (or semantic but no key / need indexing)
    if (!debouncedQuery.trim()) return allConversations
    return Array.from(searchResults.values()).map((r) => r.conversation)
  }, [
    searchMode,
    openAIKey,
    needIndexing,
    isIndexing,
    debouncedQuery,
    allConversations,
    searchResults,
    semanticConversations,
  ])

  const conversations = useMemo(() => {
    return applyFilters(afterSearch, {
      datePreset,
      selectedModels,
      starredOnly,
      hasCodeOnly,
      minMessageCount,
    })
  }, [
    afterSearch,
    datePreset,
    selectedModels,
    starredOnly,
    hasCodeOnly,
    minMessageCount,
  ])

  return {
    conversations,
    searchResults,
    isLoading: isLoading || (searchMode === 'semantic' && semanticLoading),
    searchQuery,
    setSearchQuery,
    searchMode,
    setSearchMode,
    needIndexing,
    isIndexing,
    indexProgress,
    startIndexing,
  }
}
