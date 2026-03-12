import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { Conversation, Message } from '@/types'

function toConversation(row: Record<string, unknown>): Conversation {
  return {
    id: row.id as string,
    title: row.title as string,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt as number | string),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt : new Date(row.updatedAt as number | string),
    messageCount: row.messageCount as number,
    model: row.model as string,
    tags: (row.tags as string[]) ?? [],
    isStarred: (row.isStarred as boolean) ?? false,
    isArchived: (row.isArchived as boolean) ?? false,
    summary: row.summary as string | undefined,
    embeddingId: row.embeddingId as string | undefined,
    firstMessageSnippet: row.firstMessageSnippet as string | undefined,
    hasCode: row.hasCode as boolean | undefined,
  }
}

export function useConversations(): { conversations: Conversation[]; isLoading: boolean } {
  const raw = useLiveQuery(
    () =>
      db.conversations
        .orderBy('updatedAt')
        .reverse()
        .toArray()
        .catch((err) => {
          console.error('IndexedDB failed:', err)
          return []
        }),
    []
  )
  const conversations = raw ? raw.map((r) => toConversation(r as unknown as Record<string, unknown>)) : []
  return { conversations, isLoading: raw === undefined }
}

export function useConversation(id: string | null): { conversation: Conversation | null; isLoading: boolean } {
  const raw = useLiveQuery(
    () =>
      id
        ? db.conversations.get(id).catch((err) => {
            console.error('IndexedDB failed:', err)
            return undefined
          })
        : Promise.resolve(undefined),
    [id]
  )
  const conversation = raw ? toConversation(raw as unknown as Record<string, unknown>) : null
  return { conversation, isLoading: raw === undefined }
}

function toMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    conversationId: row.conversationId as string,
    role: row.role as Message['role'],
    content: row.content as string,
    createdAt: row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt as number | string),
    model: row.model as string | undefined,
    tokenEstimate: row.tokenEstimate as number | undefined,
  }
}

export function useMessages(conversationId: string | null): { messages: Message[]; isLoading: boolean } {
  const raw = useLiveQuery(
    () =>
      conversationId
        ? db.messages
            .where('conversationId')
            .equals(conversationId)
            .sortBy('createdAt')
            .catch((err) => {
              console.error('IndexedDB failed:', err)
              return []
            })
        : (Promise.resolve([]) as Promise<Message[]>),
    [conversationId]
  )
  const messages = raw ? raw.map((r) => toMessage(r as unknown as Record<string, unknown>)) : []
  return { messages, isLoading: raw === undefined }
}
