import { useState } from 'react'
import { useSearch } from '@/hooks/useSearch'
import { useConversationStore } from '@/store/useConversationStore'
import { useFilterStore } from '@/store/useFilterStore'
import { deleteConversations } from '@/lib/conversationActions'
import { ConversationItem } from './ConversationItem'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
export function ConversationList() {
  const { conversations, searchResults, isLoading } = useSearch()
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const setActiveConversationId = useConversationStore((s) => s.setActiveConversationId)
  const selectedIds = useConversationStore((s) => s.selectedIds)
  const toggleSelection = useConversationStore((s) => s.toggleSelection)
  const clearSelection = useConversationStore((s) => s.clearSelection)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const hasActiveFilters = useFilterStore((s) => {
    const q = s.searchQuery.trim()
    const date = s.datePreset !== 'all'
    const models = s.selectedModels.size > 0
    const starred = s.starredOnly
    const hasCode = s.hasCodeOnly
    const minMsg = s.minMessageCount > 0
    return q.length > 0 || date || models || starred || hasCode || minMsg
  })

  const handleBulkDeleteConfirm = async () => {
    const ids = Array.from(selectedIds)
    await deleteConversations(ids)
    if (activeConversationId && ids.includes(activeConversationId)) {
      setActiveConversationId(null)
    }
    clearSelection()
    setBulkDeleteOpen(false)
  }

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
    <div className="flex flex-col flex-1 min-h-0">
      {selectedIds.size > 0 && (
        <div className="shrink-0 flex items-center justify-between gap-2 px-2 py-2 border-b border-border bg-muted/50">
          <span className="text-sm text-muted-foreground">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={clearSelection}>
              Clear
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-0.5 overflow-auto flex-1">
        {conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={activeConversationId === conv.id}
            isSelected={selectedIds.has(conv.id)}
            onSelect={() => setActiveConversationId(conv.id)}
            onToggleSelect={() => toggleSelection(conv.id)}
            searchResult={searchResults.get(conv.id)}
          />
        ))}
      </div>

      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.size} conversations?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected conversations and all their messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
