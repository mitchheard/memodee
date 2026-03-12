import Dexie, { type Table } from 'dexie'
import type { Conversation, Message, ConversationEmbedding } from '@/types'

export class AppDB extends Dexie {
  conversations!: Table<Conversation>
  messages!: Table<Message>
  embeddings!: Table<ConversationEmbedding>

  constructor() {
    super('ChatGPTArchive')
    this.version(1).stores({
      conversations: 'id, createdAt, updatedAt, model, isStarred, isArchived',
      messages: 'id, conversationId, role, createdAt',
      embeddings: 'conversationId',
    })
  }
}

export const db = new AppDB()
