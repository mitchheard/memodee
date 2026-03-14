import { useState, useRef, useEffect } from 'react'
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
import { Star, Trash2, Share2, MessageSquare, AlertCircle, Loader2, ChevronDown } from 'lucide-react'

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
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const messagesScrollRef = useRef<HTMLDivElement>(null)

  // Scroll to top when a conversation has finished loading (so the messages container is in the DOM)
  useEffect(() => {
    if (convLoading || msgLoading) return
    const el = messagesScrollRef.current
    if (!el) return
    const id = requestAnimationFrame(() => el.scrollTo({ top: 0 }))
    return () => cancelAnimationFrame(id)
  }, [activeConversationId, convLoading, msgLoading])

  // Show/hide scroll-to-bottom button based on scroll position
  useEffect(() => {
    const el = messagesScrollRef.current
    if (!el || messages.length === 0) return
    const threshold = 80
    const check = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      setShowScrollToBottom(scrollHeight - scrollTop - clientHeight > threshold)
    }
    check()
    el.addEventListener('scroll', check, { passive: true })
    return () => el.removeEventListener('scroll', check)
  }, [messages.length])

  const scrollToBottom = () => {
    messagesScrollRef.current?.scrollTo({ top: messagesScrollRef.current.scrollHeight, behavior: 'smooth' })
  }

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
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 animate-in fade-in duration-200">
        <div className="rounded-full bg-muted p-3">
          <MessageSquare className="size-8 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground">Select a conversation</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          Choose one from the list to read and export.
        </p>
      </div>
    )
  }

  if (convLoading || msgLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground animate-in fade-in duration-150">
        <Loader2 className="size-8 animate-spin" />
        <p className="text-sm">Loading…</p>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8 animate-in fade-in duration-200">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <p className="text-sm font-medium text-foreground">Conversation not found</p>
        <p className="text-sm text-muted-foreground max-w-xs">
          It may have been deleted or the link is invalid.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-w-0 flex-1">
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
      <div className="flex-1 min-h-0 relative">
        <div
          ref={messagesScrollRef}
          className="absolute inset-0 overflow-auto p-4 space-y-4"
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
        </div>
        {showScrollToBottom && (
          <Button
            variant="secondary"
            size="icon"
            onClick={scrollToBottom}
            className="absolute bottom-4 right-4 h-10 w-10 rounded-full shadow-lg border bg-background/95 backdrop-blur hover:bg-background"
            aria-label="Scroll to bottom"
            title="Scroll to bottom"
          >
            <ChevronDown className="size-5" />
          </Button>
        )}
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
