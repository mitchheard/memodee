import { useState, useEffect } from 'react'
import { db } from '@/lib/db'
import { embedQuery, cosineSimilarity } from '@/lib/embeddings'
import type { Conversation } from '@/types'

export function useSemanticSearch(
  query: string,
  enabled: boolean,
  apiKey: string
): { conversations: Conversation[]; isLoading: boolean } {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!enabled || !query.trim() || !apiKey.trim()) {
      setConversations([])
      return
    }
    let cancelled = false
    setConversations([])
    setIsLoading(true)
    ;(async () => {
      try {
        const queryVector = await embedQuery(apiKey, query)
        const all = await db.embeddings.toArray()
        const withScore = all.map((e) => ({
          conversationId: e.conversationId,
          score: cosineSimilarity(e.vector, queryVector),
        }))
        withScore.sort((a, b) => b.score - a.score)
        const ids = withScore.map((x) => x.conversationId)
        const convos = await db.conversations.bulkGet(ids)
        const ordered = ids
          .map((id) => convos.find((c) => c?.id === id))
          .filter((c): c is Conversation => c != null)
        if (!cancelled) setConversations(ordered)
      } catch {
        if (!cancelled) setConversations([])
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [query, enabled, apiKey])

  return { conversations, isLoading }
}
