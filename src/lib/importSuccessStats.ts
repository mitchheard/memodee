import type { AnalyticsData } from '@/hooks/useAnalytics'

export type ImportSuccessStatCard = {
  key: string
  title: string
  value: string
}

function sameLocalCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function parseMessagesPerDayKey(day: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null
  const [y, m, d] = day.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function formatMediumDate(d: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d)
}

/** Human-readable history span from analytics aggregates (no extra DB reads). */
export function formatHistoryStatValue(data: AnalyticsData): string | null {
  const firstC = data.firstConversationDate
  const lastC = data.lastConversationDate
  if (firstC && lastC) {
    if (sameLocalCalendarDay(firstC, lastC)) return formatMediumDate(firstC)
    return `${formatMediumDate(firstC)} – ${formatMediumDate(lastC)}`
  }
  if (firstC) return `Since ${formatMediumDate(firstC)}`

  if (data.messagesPerDay.length > 0) {
    const firstD = parseMessagesPerDayKey(data.messagesPerDay[0].date)
    const lastD = parseMessagesPerDayKey(
      data.messagesPerDay[data.messagesPerDay.length - 1].date
    )
    if (firstD && lastD) {
      if (sameLocalCalendarDay(firstD, lastD)) return formatMediumDate(firstD)
      return `${formatMediumDate(firstD)} – ${formatMediumDate(lastD)}`
    }
  }
  return null
}

export function inclusiveLocalDaySpan(first: Date, last: Date): number {
  const a = Date.UTC(first.getFullYear(), first.getMonth(), first.getDate())
  const b = Date.UTC(last.getFullYear(), last.getMonth(), last.getDate())
  return Math.floor((b - a) / 86400000) + 1
}

function topModelDisplayName(data: AnalyticsData): string | null {
  const sorted = [...data.modelCounts].sort((a, b) => b.value - a.value)
  const top = sorted[0]
  if (!top || !top.name.trim() || top.name === 'unknown') return null
  return top.name
}

/**
 * 3–4 summary cards for the post-import screen. Values come only from `AnalyticsData`
 * (same memo as the Analytics page).
 */
export function buildImportSuccessStatCards(data: AnalyticsData): ImportSuccessStatCard[] {
  const cards: ImportSuccessStatCard[] = [
    {
      key: 'conversations',
      title: 'Conversations',
      value: data.totalConversations.toLocaleString(),
    },
    {
      key: 'messages',
      title: 'Total messages',
      value: data.totalMessages.toLocaleString(),
    },
  ]

  const history = formatHistoryStatValue(data)
  if (history) {
    cards.push({ key: 'history', title: 'History span', value: history })
  }

  const model = topModelDisplayName(data)
  if (model) {
    cards.push({ key: 'model', title: 'Most-used model', value: model })
  }

  if (cards.length < 3) {
    const first = data.firstConversationDate
    const last = data.lastConversationDate
    if (first && last && !sameLocalCalendarDay(first, last)) {
      const days = inclusiveLocalDaySpan(first, last)
      if (days > 1) {
        cards.push({
          key: 'days',
          title: 'Days covered',
          value: `${days.toLocaleString()} days`,
        })
      }
    }
  }

  if (cards.length < 3 && data.estimatedTokens > 0) {
    cards.push({
      key: 'tokens',
      title: 'Est. tokens',
      value: data.estimatedTokens.toLocaleString(),
    })
  }

  return cards.slice(0, 4)
}
