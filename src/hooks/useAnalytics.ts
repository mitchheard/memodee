import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'

export interface AnalyticsData {
  totalConversations: number
  totalMessages: number
  estimatedTokens: number
  firstConversationDate: Date | null
  messagesPerDay: Array<{ date: string; count: number }>
  messagesPerMonth: Array<{ month: string; count: number }>
  modelCounts: Array<{ name: string; value: number }>
  topConversationsByLength: Array<{ id: string; title: string; count: number }>
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function toMonthKey(d: Date): string {
  return d.toISOString().slice(0, 7)
}

export function useAnalytics(): { data: AnalyticsData | null; isLoading: boolean } {
  const conversations = useLiveQuery(() => db.conversations.toArray(), [])
  const messages = useLiveQuery(() => db.messages.toArray(), [])

  const data = useMemo((): AnalyticsData | null => {
    if (conversations === undefined || messages === undefined) return null
    const convos = conversations as Array<{ id: string; title: string; messageCount: number; model: string; createdAt: unknown; updatedAt: unknown }>
    const msgs = messages as Array<{ content?: string; createdAt: unknown }>

    const totalConversations = convos.length
    const totalMessages = msgs.length
    const estimatedTokens = msgs.reduce((sum, m) => sum + Math.floor((m.content?.length ?? 0) / 4), 0)

    let firstConversationDate: Date | null = null
    if (convos.length > 0) {
      let minTs = Infinity
      for (const c of convos) {
        const t = c.createdAt instanceof Date ? c.createdAt.getTime() : new Date(c.createdAt as number | string).getTime()
        if (t < minTs) minTs = t
      }
      firstConversationDate = Number.isFinite(minTs) ? new Date(minTs) : null
    }

    const dayCounts = new Map<string, number>()
    for (const m of msgs) {
      const d = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt as number | string)
      const key = toDateKey(d)
      dayCounts.set(key, (dayCounts.get(key) ?? 0) + 1)
    }
    const messagesPerDay = Array.from(dayCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const monthCounts = new Map<string, number>()
    for (const m of msgs) {
      const d = m.createdAt instanceof Date ? m.createdAt : new Date(m.createdAt as number | string)
      const key = toMonthKey(d)
      monthCounts.set(key, (monthCounts.get(key) ?? 0) + 1)
    }
    const messagesPerMonth = Array.from(monthCounts.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))

    const modelCountsMap = new Map<string, number>()
    for (const c of convos) {
      const name = c.model || 'unknown'
      modelCountsMap.set(name, (modelCountsMap.get(name) ?? 0) + 1)
    }
    const modelCounts = Array.from(modelCountsMap.entries()).map(([name, value]) => ({ name, value }))

    const topConversationsByLength = [...convos]
      .sort((a, b) => (b.messageCount ?? 0) - (a.messageCount ?? 0))
      .slice(0, 10)
      .map((c) => ({ id: c.id, title: (c.title || 'Untitled').slice(0, 40), count: c.messageCount ?? 0 }))

    return {
      totalConversations,
      totalMessages,
      estimatedTokens,
      firstConversationDate,
      messagesPerDay,
      messagesPerMonth,
      modelCounts,
      topConversationsByLength,
    }
  }, [conversations, messages])

  return { data, isLoading: conversations === undefined || messages === undefined }
}
