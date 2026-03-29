import { useEffect } from 'react'
import { ConversationView } from '@/components/conversations/ConversationView'
import { useConversations } from '@/hooks/useConversations'
import { useConversationStore } from '@/store/useConversationStore'
import { Link, useSearchParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Library() {
  const { conversations, isLoading } = useConversations()
  const [searchParams] = useSearchParams()
  const setActiveConversationId = useConversationStore((s) => s.setActiveConversationId)

  useEffect(() => {
    const id = searchParams.get('c')
    if (id) setActiveConversationId(id)
  }, [searchParams, setActiveConversationId])

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
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ConversationView />
    </div>
  )
}
