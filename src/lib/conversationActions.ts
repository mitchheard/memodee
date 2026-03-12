import { db } from './db'

export async function deleteConversation(id: string): Promise<void> {
  await db.transaction('rw', db.conversations, db.messages, db.embeddings, async () => {
    await db.conversations.delete(id)
    await db.messages.where('conversationId').equals(id).delete()
    await db.embeddings.where('conversationId').equals(id).delete()
  })
}

export async function deleteConversations(ids: string[]): Promise<void> {
  await db.transaction('rw', db.conversations, db.messages, db.embeddings, async () => {
    for (const id of ids) {
      await db.conversations.delete(id)
      await db.messages.where('conversationId').equals(id).delete()
      await db.embeddings.where('conversationId').equals(id).delete()
    }
  })
}

export async function toggleStar(conversationId: string, currentStarred: boolean): Promise<void> {
  await db.conversations.update(conversationId, { isStarred: !currentStarred })
}
