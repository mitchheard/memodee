import { useSearch } from '@/hooks/useSearch'
import { useConversationStore } from '@/store/useConversationStore'
import { useFilterStore } from '@/store/useFilterStore'
import { ConversationItem } from './ConversationItem'

export function ConversationList() {
  const { conversations, searchResults, isLoading } = useSearch()
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const setActiveConversationId = useConversationStore((s) => s.setActiveConversationId)
  const hasActiveFilters = useFilterStore((s) => {
    const q = s.searchQuery.trim()
    const date = s.datePreset !== 'all'
    const models = s.selectedModels.size > 0
    const starred = s.starredOnly
    const hasCode = s.hasCodeOnly
    const minMsg = s.minMessageCount > 0
    return q.length > 0 || date || models || starred || hasCode || minMsg
  })

  if (isLoading) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        {hasActiveFilters
          ? 'No conversations match your filters.'
          : 'No conversations. Import a ChatGPT export to get started.'}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-0.5 overflow-auto">
      {conversations.map((conv) => (
        <ConversationItem
          key={conv.id}
          conversation={conv}
          isActive={activeConversationId === conv.id}
          onSelect={() => setActiveConversationId(conv.id)}
          searchResult={searchResults.get(conv.id)}
        />
      ))}
    </div>
  )
}
