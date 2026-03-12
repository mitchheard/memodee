import { cn } from '@/lib/utils'
import { highlightMatches } from '@/lib/search'
import type { Conversation } from '@/types'
import type { SearchResult } from '@/lib/search'

interface ConversationItemProps {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  searchResult?: SearchResult
}

function formatRelative(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

function modelBadge(model: string): string {
  const slug = model.toLowerCase()
  if (slug.includes('gpt-4o')) return 'GPT-4o'
  if (slug.includes('gpt-4')) return 'GPT-4'
  if (slug.includes('gpt-3.5') || slug.includes('gpt-3')) return 'GPT-3.5'
  if (slug.includes('o1')) return 'o1'
  return model.split('/').pop() ?? model
}

export function ConversationItem({ conversation, isActive, onSelect, searchResult }: ConversationItemProps) {
  const titleMatch = searchResult?.matches?.find((m) => m.key === 'title')
  const titleDisplay =
    titleMatch?.indices?.length && titleMatch.indices.length > 0
      ? highlightMatches(conversation.title || 'Untitled', titleMatch.indices)
      : conversation.title || 'Untitled'

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg transition-colors',
        'hover:bg-muted/80',
        isActive && 'bg-muted'
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="truncate font-medium text-sm flex-1">
          {titleMatch?.indices?.length ? (
            <span dangerouslySetInnerHTML={{ __html: titleDisplay }} />
          ) : (
            titleDisplay
          )}
        </span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatRelative(conversation.updatedAt)}
        </span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
          {modelBadge(conversation.model)}
        </span>
        <span className="text-xs text-muted-foreground">{conversation.messageCount} messages</span>
      </div>
    </button>
  )
}
