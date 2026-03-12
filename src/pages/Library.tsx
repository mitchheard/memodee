import { ConversationView } from '@/components/conversations/ConversationView'
import { useConversations } from '@/hooks/useConversations'
import { Link } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Library() {
  const { conversations, isLoading } = useConversations()

  if (!isLoading && conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-8 animate-in fade-in duration-200">
        <div className="rounded-full bg-muted p-4">
          <Inbox className="size-10 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-foreground">No conversations yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Import a ChatGPT export from the Import page to browse and search your history.
          </p>
        </div>
        <Link to="/">
          <Button>Import your first export</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
      <ConversationView />
    </div>
  )
}
