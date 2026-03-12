import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import { parseExport } from '@/lib/parser'
import type { ChatGPTExportConversation } from '@/types'
import { db } from '@/lib/db'

const CONVERSATION_BATCH = 100
const MESSAGE_BATCH = 500

export interface ImportProgress {
  stage: 'idle' | 'reading' | 'parsing' | 'writing' | 'done' | 'error'
  totalConversations?: number
  processedConversations?: number
  totalMessages?: number
  processedMessages?: number
  message?: string
}

export function useImport() {
  const [progress, setProgress] = useState<ImportProgress>({ stage: 'idle' })
  const [error, setError] = useState<string | null>(null)

  const importFile = useCallback(async (file: File) => {
    setError(null)
    setProgress({ stage: 'reading' })

    try {
      const zip = await JSZip.loadAsync(file)
      const conversationsFile = zip.file('conversations.json')
      if (!conversationsFile) {
        throw new Error('ZIP must contain conversations.json')
      }

      const json = await conversationsFile.async('string')
      setProgress({ stage: 'parsing' })

      const raw: ChatGPTExportConversation[] = JSON.parse(json)
      if (!Array.isArray(raw)) {
        throw new Error('conversations.json must be an array')
      }

      const { conversations, messages } = parseExport(raw)

      if (conversations.length === 0) {
        setProgress({ stage: 'done', message: 'No valid conversations found' })
        return { count: 0 }
      }

      setProgress({
        stage: 'writing',
        totalConversations: conversations.length,
        processedConversations: 0,
        totalMessages: messages.length,
        processedMessages: 0,
      })

      // Batch insert conversations (Dexie transaction size limits)
      for (let i = 0; i < conversations.length; i += CONVERSATION_BATCH) {
        const batch = conversations.slice(i, i + CONVERSATION_BATCH)
        await db.conversations.bulkPut(batch)
        setProgress((p) => ({
          ...p,
          processedConversations: Math.min(i + CONVERSATION_BATCH, conversations.length),
        }))
        await new Promise((r) => setTimeout(r, 0))
      }

      for (let i = 0; i < messages.length; i += MESSAGE_BATCH) {
        const batch = messages.slice(i, i + MESSAGE_BATCH)
        await db.messages.bulkPut(batch)
        setProgress((p) => ({
          ...p,
          processedMessages: Math.min(i + MESSAGE_BATCH, messages.length),
        }))
        await new Promise((r) => setTimeout(r, 0))
      }

      setProgress({
        stage: 'done',
        totalConversations: conversations.length,
        processedConversations: conversations.length,
        totalMessages: messages.length,
        processedMessages: messages.length,
        message: `${conversations.length.toLocaleString()} conversations imported`,
      })
      return { count: conversations.length }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Import failed'
      setError(message)
      setProgress({ stage: 'error', message })
      throw e
    }
  }, [])

  const reset = useCallback(() => {
    setProgress({ stage: 'idle' })
    setError(null)
  }, [])

  return { importFile, progress, error, reset }
}
