import type {
  Conversation,
  Message,
  ChatGPTExportConversation,
  ChatGPTExportNode,
} from '@/types'

/**
 * Extract text from a message's content (handles text, multimodal_text, null).
 */
function getMessageText(node: ChatGPTExportNode): string | null {
  const msg = node.message
  if (!msg?.content) return null
  const { parts } = msg.content
  if (!parts?.length) return null
  // Flatten text parts; for multimodal we only take text (spec: "note image was present")
  const text = parts
    .filter((p): p is string => typeof p === 'string')
    .join('\n')
    .trim()
  return text || null
}

/**
 * Find root node id (node whose parent is null or missing from mapping).
 */
function findRootId(mapping: Record<string, ChatGPTExportNode>): string | null {
  const ids = new Set(Object.keys(mapping))
  for (const id of ids) {
    const node = mapping[id]
    const parent = node?.parent
    if (parent == null || !ids.has(parent)) return id
  }
  return null
}

/**
 * Walk mapping following children[0] from root to get ordered node ids.
 */
function getOrderedNodeIds(
  mapping: Record<string, ChatGPTExportNode>,
  rootId: string
): string[] {
  const ordered: string[] = []
  let currentId: string | null = rootId
  while (currentId) {
    ordered.push(currentId)
    const node: ChatGPTExportNode | undefined = mapping[currentId]
    const nextId: string | undefined = node?.children?.[0]
    currentId = nextId && mapping[nextId] ? nextId : null
  }
  return ordered
}

/**
 * Parse one ChatGPT export conversation into Conversation + Message[].
 * Skips conversations with no messages.
 */
export function parseConversation(
  raw: ChatGPTExportConversation
): { conversation: Conversation; messages: Message[] } | null {
  const mapping = raw.mapping ?? {}
  const rootId = findRootId(mapping)
  if (rootId == null) return null

  const nodeIds = getOrderedNodeIds(mapping, rootId)
  const messages: Message[] = []
  let model = 'unknown'

  for (const nodeId of nodeIds) {
    const node = mapping[nodeId]
    const msg = node?.message
    if (!msg) continue

    const role = msg.author?.role ?? 'user'
    const text = getMessageText(node)
    if (text == null) continue

    if (role === 'assistant' && msg.metadata?.model_slug) {
      model = msg.metadata.model_slug
    }

    const createTime = msg.create_time != null ? msg.create_time * 1000 : Date.now()
    messages.push({
      id: msg.id ?? `${raw.id}-${nodeId}`,
      conversationId: raw.id,
      role,
      content: text,
      createdAt: new Date(createTime),
      model: role === 'assistant' ? msg.metadata?.model_slug : undefined,
    })
  }

  if (messages.length === 0) return null

  const createTime = (raw.create_time ?? 0) * 1000
  const updateTime = (raw.update_time ?? 0) * 1000

  const conversation: Conversation = {
    id: raw.id,
    title: raw.title || 'Untitled',
    createdAt: new Date(createTime),
    updatedAt: new Date(updateTime),
    messageCount: messages.length,
    model,
    tags: [],
    isStarred: false,
    isArchived: false,
  }

  return { conversation, messages }
}

/**
 * Parse full conversations.json array.
 */
export function parseExport(
  rawConversations: ChatGPTExportConversation[]
): { conversations: Conversation[]; messages: Message[] } {
  const conversations: Conversation[] = []
  const messages: Message[] = []

  for (const raw of rawConversations) {
    const result = parseConversation(raw)
    if (result) {
      conversations.push(result.conversation)
      messages.push(...result.messages)
    }
  }

  return { conversations, messages }
}
