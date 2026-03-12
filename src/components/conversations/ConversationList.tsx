import { useConversations } from '@/hooks/useConversations'
import { useConversationStore } from '@/store/useConversationStore'
import { ConversationItem } from './ConversationItem'

export function ConversationList() {
  const { conversations, isLoading } = useConversations()
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const setActiveConversationId = useConversationStore((s) => s.setActiveConversationId)

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
        No conversations. Import a ChatGPT export to get started.
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
        />
      ))}
    </div>
  )
}
