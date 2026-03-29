import { describe, it, expect } from 'vitest'
import type { AnalyticsData } from '@/hooks/useAnalytics'
import {
  buildImportSuccessStatCards,
  formatHistoryStatValue,
  inclusiveLocalDaySpan,
} from './importSuccessStats'

function makeData(partial: Partial<AnalyticsData>): AnalyticsData {
  return {
    totalConversations: 0,
    totalMessages: 0,
    estimatedTokens: 0,
    firstConversationDate: null,
    lastConversationDate: null,
    messagesPerDay: [],
    messagesPerMonth: [],
    modelCounts: [],
    topConversationsByLength: [],
    ...partial,
  }
}

describe('formatHistoryStatValue', () => {
  it('formats a single day when first and last conversation match', () => {
    const d = new Date(2024, 5, 10)
    const v = formatHistoryStatValue(
      makeData({
        firstConversationDate: d,
        lastConversationDate: new Date(2024, 5, 10),
      })
    )
    expect(v).toBeTruthy()
    expect(v).not.toContain('–')
  })

  it('formats a range from conversation dates', () => {
    const v = formatHistoryStatValue(
      makeData({
        firstConversationDate: new Date(2023, 0, 1),
        lastConversationDate: new Date(2024, 2, 15),
      })
    )
    expect(v).toContain('–')
  })

  it('uses messagesPerDay when conversation dates are missing', () => {
    const v = formatHistoryStatValue(
      makeData({
        firstConversationDate: null,
        lastConversationDate: null,
        messagesPerDay: [
          { date: '2024-01-05', count: 1 },
          { date: '2024-02-20', count: 2 },
        ],
      })
    )
    expect(v).toContain('–')
  })
})

describe('inclusiveLocalDaySpan', () => {
  it('counts inclusive calendar days', () => {
    expect(
      inclusiveLocalDaySpan(new Date(2024, 0, 1), new Date(2024, 0, 1))
    ).toBe(1)
    expect(
      inclusiveLocalDaySpan(new Date(2024, 0, 1), new Date(2024, 0, 3))
    ).toBe(3)
  })
})

describe('buildImportSuccessStatCards', () => {
  it('includes conversations, messages, and at least one more summary stat', () => {
    const cards = buildImportSuccessStatCards(
      makeData({
        totalConversations: 494,
        totalMessages: 12040,
        estimatedTokens: 500_000,
        firstConversationDate: new Date(2023, 5, 1),
        lastConversationDate: new Date(2025, 1, 1),
        modelCounts: [
          { name: 'gpt-4o', value: 400 },
          { name: 'gpt-4', value: 94 },
        ],
      })
    )
    expect(cards.length).toBeGreaterThanOrEqual(3)
    expect(cards.find((c) => c.key === 'conversations')?.value.replace(/\D/g, '')).toBe('494')
    expect(cards.find((c) => c.key === 'messages')?.value.replace(/\D/g, '')).toBe('12040')
    expect(cards.some((c) => c.key === 'history')).toBe(true)
    expect(cards.some((c) => c.key === 'model')).toBe(true)
  })

  it('omits most-used model when the top bucket is unknown', () => {
    const cards = buildImportSuccessStatCards(
      makeData({
        totalConversations: 3,
        totalMessages: 10,
        estimatedTokens: 100,
        firstConversationDate: new Date(2024, 0, 1),
        lastConversationDate: new Date(2024, 0, 2),
        modelCounts: [{ name: 'unknown', value: 3 }],
      })
    )
    expect(cards.some((c) => c.key === 'model')).toBe(false)
    expect(cards.length).toBeGreaterThanOrEqual(3)
  })

  it('caps at four cards', () => {
    const cards = buildImportSuccessStatCards(
      makeData({
        totalConversations: 100,
        totalMessages: 1000,
        estimatedTokens: 9000,
        firstConversationDate: new Date(2023, 0, 1),
        lastConversationDate: new Date(2025, 0, 1),
        modelCounts: [{ name: 'gpt-4o', value: 100 }],
      })
    )
    expect(cards.length).toBeLessThanOrEqual(4)
  })
})
