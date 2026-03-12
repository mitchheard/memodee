import type { Conversation, Message } from '@/types'

export interface NotionShareResult {
  pageId: string
  url: string
}

export async function shareConversationToNotion(
  token: string,
  databaseId: string,
  conversation: Conversation,
  messages: Message[]
): Promise<NotionShareResult> {
  const payload = {
    token,
    databaseId: databaseId.trim().replace(/-/g, ''),
    conversation: {
      id: conversation.id,
      title: conversation.title,
      createdAt: conversation.createdAt instanceof Date ? conversation.createdAt.toISOString() : new Date(conversation.createdAt as number | string).toISOString(),
      updatedAt: conversation.updatedAt instanceof Date ? conversation.updatedAt.toISOString() : new Date(conversation.updatedAt as number | string).toISOString(),
      messageCount: conversation.messageCount,
      model: conversation.model,
      tags: conversation.tags ?? [],
    },
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  }
  const res = await fetch('/api/notion-proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as { error?: string }).error || res.statusText || 'Failed to share to Notion')
  }
  const data = (await res.json()) as NotionShareResult
  return { pageId: data.pageId, url: data.url }
}
