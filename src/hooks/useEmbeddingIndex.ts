import { useState, useCallback } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { indexConversations, type IndexProgress } from '@/lib/embeddings'
import type { Conversation } from '@/types'

export function useEmbeddingIndex(conversations: Conversation[]): {
  needIndexing: boolean
  isIndexing: boolean
  indexProgress: IndexProgress | null
  startIndexing: (apiKey: string) => Promise<void>
} {
  const embeddingCount = useLiveQuery(() => db.embeddings.count(), [])
  const [isIndexing, setIsIndexing] = useState(false)
  const [indexProgress, setIndexProgress] = useState<IndexProgress | null>(null)

  const total = conversations.length
  const count = embeddingCount ?? 0
  const needIndexing = total > 0 && count < total

  const startIndexing = useCallback(
    async (apiKey: string) => {
      if (total === 0 || isIndexing) return
      setIsIndexing(true)
      setIndexProgress({ current: 0, total })
      try {
        await db.embeddings.clear()
        await indexConversations(
          apiKey,
          conversations.map((c) => ({
            id: c.id,
            title: c.title,
            firstMessageSnippet: c.firstMessageSnippet,
          })),
          setIndexProgress
        )
      } finally {
        setIsIndexing(false)
        setIndexProgress(null)
      }
    },
    [conversations, total, isIndexing]
  )

  return { needIndexing, isIndexing, indexProgress, startIndexing }
}
