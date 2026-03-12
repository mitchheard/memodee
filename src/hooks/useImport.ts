import { useState, useCallback } from 'react'
import JSZip from 'jszip'
import { parseExport } from '@/lib/parser'
import type { ChatGPTExportConversation } from '@/types'
import { db } from '@/lib/db'

const CONVERSATION_BATCH = 100
const MESSAGE_BATCH = 500

// ChatGPT export may use: single file or numbered files (conversations-000.json, …)
const CONVERSATIONS_FILENAMES = ['conversations.json', 'shared_conversations.json']
const NUMBERED_PATTERN = /conversations-(\d+)\.json$/i

/** Unwrap export JSON: accept top-level array or object with conversations/data/items array, or single conversation object. */
function normalizeToConversationArray(parsed: unknown): ChatGPTExportConversation[] {
  if (Array.isArray(parsed)) return parsed as ChatGPTExportConversation[]
  if (parsed && typeof parsed === 'object') {
    const obj = parsed as Record<string, unknown>
    for (const key of ['conversations', 'data', 'items']) {
      const val = obj[key]
      if (Array.isArray(val)) return val as ChatGPTExportConversation[]
    }
    // Single conversation object (e.g. in conversations-000.json)
    if (typeof obj.id === 'string' && (obj.mapping != null || obj.messages != null)) {
      return [obj as ChatGPTExportConversation]
    }
  }
  return []
}

function findConversationsFile(zip: JSZip): JSZip.JSZipObject | null {
  for (const name of CONVERSATIONS_FILENAMES) {
    const atRoot = zip.file(name)
    if (atRoot) return atRoot
    const inFolder = Object.keys(zip.files).find(
      (path) => path === name || path.endsWith('/' + name)
    )
    if (inFolder) return zip.file(inFolder)!
  }
  return null
}

/** Find all conversations-000.json, conversations-001.json, … (at root or in any folder), sorted by number. */
function findNumberedConversationFiles(zip: JSZip): JSZip.JSZipObject[] {
  const matches: { num: number; file: JSZip.JSZipObject }[] = []
  for (const path of Object.keys(zip.files)) {
    const name = path.split('/').pop() ?? path
    const m = name.match(NUMBERED_PATTERN)
    if (m) {
      const file = zip.file(path)
      if (file) matches.push({ num: parseInt(m[1], 10), file })
    }
  }
  matches.sort((a, b) => a.num - b.num)
  return matches.map((m) => m.file)
}

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
      let raw: ChatGPTExportConversation[] = []

      const singleFile = findConversationsFile(zip)
      if (singleFile) {
        const json = await singleFile.async('string')
        setProgress({ stage: 'parsing' })
        const parsed: unknown = JSON.parse(json)
        raw = normalizeToConversationArray(parsed)
      } else {
        const numberedFiles = findNumberedConversationFiles(zip)
        if (numberedFiles.length === 0) {
          throw new Error(
            'ZIP must contain conversations.json, shared_conversations.json, or conversations-000.json (and similar). Export from ChatGPT: Settings → Data → Export data.'
          )
        }
        setProgress({ stage: 'parsing' })
        for (const f of numberedFiles) {
          const json = await f.async('string')
          const parsed: unknown = JSON.parse(json)
          raw.push(...normalizeToConversationArray(parsed))
        }
      }

      if (!raw.length) {
        throw new Error('Export JSON must contain an array of conversations (or an object with conversations/data/items array)')
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
