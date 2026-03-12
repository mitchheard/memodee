import { ConversationView } from '@/components/conversations/ConversationView'
import { useConversations } from '@/hooks/useConversations'
import { Link } from 'react-router-dom'

export function Library() {
  const { conversations, isLoading } = useConversations()

  if (!isLoading && conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
        <p className="text-muted-foreground">No conversations yet.</p>
        <Link to="/" className="text-primary hover:underline">
          Import your first ChatGPT export
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      <ConversationView />
    </div>
  )
}
