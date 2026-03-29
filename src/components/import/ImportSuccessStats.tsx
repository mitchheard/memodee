import { useAnalytics } from '@/hooks/useAnalytics'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { buildImportSuccessStatCards } from '@/lib/importSuccessStats'
import { cn } from '@/lib/utils'

export function ImportSuccessStats({ className }: { className?: string }) {
  const { data, isLoading } = useAnalytics()

  if (isLoading || !data) return null
  if (data.totalConversations === 0 && data.totalMessages === 0) return null

  const cards = buildImportSuccessStatCards(data)
  if (cards.length === 0) return null

  return (
    <div
      className={cn(
        'grid w-full grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4',
        className
      )}
    >
      {cards.map((c) => (
        <Card key={c.key} className="border-border/80 bg-card/50 shadow-sm">
          <CardHeader className="pb-1 pt-3 px-3 sm:px-4 sm:pt-4">
            <CardDescription className="text-xs sm:text-sm">{c.title}</CardDescription>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
            <p className="text-lg font-semibold tabular-nums sm:text-xl leading-snug break-words">
              {c.value}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
