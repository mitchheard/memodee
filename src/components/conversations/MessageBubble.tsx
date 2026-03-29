import { cn } from '@/lib/utils'
import type { Message } from '@/types'
import { MessageMarkdown } from './MessageMarkdown'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div
      className={cn(
        'rounded-lg px-4 py-3 max-w-[85%] min-w-0 overflow-hidden',
        isUser && 'ml-auto bg-primary text-primary-foreground',
        isAssistant && 'mr-auto bg-muted',
        (message.role === 'system' || message.role === 'tool') && 'mr-auto bg-muted/70 text-muted-foreground text-sm'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-medium opacity-80 capitalize">{message.role}</span>
        {message.model && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-background/20">{message.model}</span>
        )}
      </div>
      {isAssistant ? (
        <MessageMarkdown content={message.content} />
      ) : (
        <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
      )}
    </div>
  )
}
