import type { ImportProgress as ImportProgressType } from '@/hooks/useImport'
import { cn } from '@/lib/utils'

interface ImportProgressProps {
  progress: ImportProgressType
  className?: string
}

export function ImportProgress({ progress, className }: ImportProgressProps) {
  const { stage, totalConversations, processedConversations, totalMessages, processedMessages, message } = progress

  if (stage === 'idle') return null

  const isWriting = stage === 'writing'
  const convProgress = totalConversations && processedConversations != null
    ? (processedConversations / totalConversations) * 100
    : 0
  const msgProgress = totalMessages && processedMessages != null
    ? (processedMessages / totalMessages) * 100
    : 0
  const overallProgress = isWriting
    ? (convProgress + msgProgress) / 2
    : stage === 'parsing'
      ? 20
      : stage === 'reading'
        ? 5
        : 100

  const stageLabel =
    stage === 'reading'
      ? 'Reading ZIP…'
      : stage === 'parsing'
        ? 'Parsing conversations…'
        : stage === 'writing'
          ? 'Writing to database…'
          : stage === 'done'
            ? 'Done'
            : stage === 'error'
              ? 'Error'
              : '…'

  return (
    <div className={cn('space-y-2 w-full max-w-md', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{stageLabel}</span>
        {stage === 'writing' && totalConversations != null && (
          <span>
            {processedConversations ?? 0} / {totalConversations} conversations
          </span>
        )}
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${overallProgress}%` }}
        />
      </div>
      {message && (
        <p className={cn(
          'text-sm',
          progress.stage === 'error' ? 'text-destructive' : 'text-muted-foreground'
        )}>
          {message}
        </p>
      )}
    </div>
  )
}
