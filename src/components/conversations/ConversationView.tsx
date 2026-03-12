import { useConversation, useMessages } from '@/hooks/useConversations'
import { useConversationStore } from '@/store/useConversationStore'
import { MessageBubble } from './MessageBubble'

export function ConversationView() {
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const { conversation, isLoading: convLoading } = useConversation(activeConversationId)
  const { messages, isLoading: msgLoading } = useMessages(activeConversationId)

  if (activeConversationId == null) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Select a conversation</p>
      </div>
    )
  }

  if (convLoading || msgLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Loading…</p>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Conversation not found</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <header className="shrink-0 border-b border-border px-4 py-3">
        <h1 className="font-semibold text-lg">{conversation.title || 'Untitled'}</h1>
        <p className="text-sm text-muted-foreground">
          {conversation.messageCount} messages · {conversation.model}
        </p>
      </header>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>
    </div>
  )
}
