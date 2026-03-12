import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useConversation, useMessages } from '@/hooks/useConversations'
import { useConversationStore } from '@/store/useConversationStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { deleteConversation, toggleStar } from '@/lib/conversationActions'
import { shareConversationToNotion } from '@/lib/notion'
import { MessageBubble } from './MessageBubble'
import { ExportMenu } from '@/components/actions/ExportMenu'
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
import { Star, Trash2, Share2 } from 'lucide-react'

export function ConversationView() {
  const navigate = useNavigate()
  const activeConversationId = useConversationStore((s) => s.activeConversationId)
  const setActiveConversationId = useConversationStore((s) => s.setActiveConversationId)
  const notionToken = useSettingsStore((s) => s.notionToken)
  const notionDatabaseId = useSettingsStore((s) => s.notionDatabaseId)
  const { conversation, isLoading: convLoading } = useConversation(activeConversationId)
  const { messages, isLoading: msgLoading } = useMessages(activeConversationId)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [notionSharing, setNotionSharing] = useState(false)

  const handleStar = async () => {
    if (!conversation) return
    await toggleStar(conversation.id, conversation.isStarred)
  }

  const handleDeleteConfirm = async () => {
    if (!activeConversationId) return
    await deleteConversation(activeConversationId)
    setActiveConversationId(null)
    setDeleteDialogOpen(false)
  }

  const handleShareToNotion = async () => {
    if (!conversation || !notionToken.trim() || !notionDatabaseId.trim()) {
      toast.error('Set Notion token and Database ID in Settings first.')
      navigate('/settings')
      return
    }
    setNotionSharing(true)
    try {
      const { url } = await shareConversationToNotion(notionToken, notionDatabaseId, conversation, messages)
      toast.success('Created in Notion', {
        description: 'Open the page in Notion',
        action: {
          label: 'Open in Notion',
          onClick: () => window.open(url, '_blank'),
        },
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to share to Notion')
    } finally {
      setNotionSharing(false)
    }
  }

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
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-lg truncate">{conversation.title || 'Untitled'}</h1>
            <p className="text-sm text-muted-foreground">
              {conversation.messageCount} messages · {conversation.model}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleStar}
              className={conversation.isStarred ? 'text-primary' : ''}
              aria-label={conversation.isStarred ? 'Unstar' : 'Star'}
            >
              <Star className={`size-4 ${conversation.isStarred ? 'fill-current' : ''}`} />
            </Button>
            <ExportMenu conversation={conversation} messages={messages} />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleShareToNotion}
              disabled={notionSharing}
              aria-label="Share to Notion"
              title="Share to Notion"
            >
              <Share2 className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeleteDialogOpen(true)}
              aria-label="Delete"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
