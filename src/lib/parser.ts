import type {
  Conversation,
  Message,
  ChatGPTExportConversation,
  ChatGPTExportMessage,
  ChatGPTExportNode,
} from '@/types'

/**
 * Extract text from a message's content (handles text, parts array, or content_type variants).
 */
function getMessageText(node: ChatGPTExportNode): string | null {
  const msg = node.message
  if (!msg?.content) return null
  const content = msg.content as { parts?: string[]; text?: string } | string
  if (typeof content === 'string') return content.trim() || null
  const text = content.text
  if (typeof text === 'string') return text.trim() || null
  const { parts } = content
  if (!parts?.length) return null
  const joined = parts
    .filter((p): p is string => typeof p === 'string')
    .join('\n')
    .trim()
  return joined || null
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
 * Collect all node ids reachable from root (walk full tree via all children).
 * Returns ids in chronological order by message create_time so the full conversation is preserved.
 */
function getAllNodeIdsInOrder(
  mapping: Record<string, ChatGPTExportNode>,
  rootId: string
): string[] {
  const collected: string[] = []
  const visited = new Set<string>()
  function walk(id: string) {
    if (visited.has(id)) return
    visited.add(id)
    collected.push(id)
    const node = mapping[id]
    const children = node?.children
    if (Array.isArray(children)) {
      for (const childId of children) {
        if (mapping[childId]) walk(childId)
      }
    }
  }
  walk(rootId)
  // Sort by message create_time so order is chronological
  collected.sort((aId, bId) => {
    const aTime = mapping[aId]?.message?.create_time ?? 0
    const bTime = mapping[bId]?.message?.create_time ?? 0
    return aTime - bTime
  })
  return collected
}

/**
 * Parse one ChatGPT export conversation into Conversation + Message[].
 * Supports (1) mapping tree format, (2) flat messages array when mapping is missing.
 * Accepts id or conversation_id; title/create_time/update_time are optional.
 */
export function parseConversation(
  raw: ChatGPTExportConversation & { messages?: Array<{ role?: string; content?: string; id?: string; create_time?: number }> }
): { conversation: Conversation; messages: Message[] } | null {
  const convId = raw.id ?? (raw as { conversation_id?: string }).conversation_id
  if (!convId) return null
  const normalized = { ...raw, id: convId } as typeof raw
  const mapping = normalized.mapping ?? {}
  let rootId = findRootId(mapping)
  // Some exports (e.g. API-style) use current_node as the thread head when parent chain differs
  const currentNode = (normalized as { current_node?: string }).current_node
  if (rootId == null && currentNode && mapping[currentNode]) rootId = currentNode

  if (rootId != null) {
    const fromMapping = parseFromMapping(normalized, mapping, rootId)
    if (fromMapping) return fromMapping
  }

  // Fallback: flat messages array (e.g. some shared_conversations.json exports)
  const rawMessages = (normalized as { messages?: unknown[] }).messages
  if (Array.isArray(rawMessages) && rawMessages.length > 0) {
    return parseFromFlatMessages(
      normalized,
      rawMessages as Array<{ role?: string; content?: string | { parts?: string[] }; id?: string; create_time?: number }>
    )
  }

  return null
}

function parseFromMapping(
  raw: ChatGPTExportConversation,
  mapping: Record<string, ChatGPTExportNode>,
  rootId: string
): { conversation: Conversation; messages: Message[] } | null {
  const nodeIds = getAllNodeIdsInOrder(mapping, rootId)
  const messages: Message[] = []
  let model = 'unknown'
  let firstUserSnippet: string | null = null
  let hasCode = false

  for (const nodeId of nodeIds) {
    const node = mapping[nodeId]
    const msg = node?.message
    if (!msg) continue

    const role = normalizeRole(msg.author)
    const text = getMessageText(node)
    if (text == null) continue

    if (role === 'user' && firstUserSnippet == null) {
      firstUserSnippet = text.slice(0, 200)
    }
    if (text.includes('```')) hasCode = true

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
    firstMessageSnippet: firstUserSnippet ?? undefined,
    hasCode,
  }

  return { conversation, messages }
}

function normalizeRole(author: ChatGPTExportMessage['author']): 'user' | 'assistant' | 'system' | 'tool' {
  if (author == null) return 'user'
  if (typeof author === 'string') return author as 'user' | 'assistant' | 'system' | 'tool'
  const role = author.role
  return (role === 'user' || role === 'assistant' || role === 'system' || role === 'tool' ? role : 'user')
}

function parseFromFlatMessages(
  raw: ChatGPTExportConversation,
  rawMessages: Array<{ role?: string; content?: string | { parts?: string[] }; id?: string; create_time?: number }>
): { conversation: Conversation; messages: Message[] } {
  const messages: Message[] = []
  let firstUserSnippet: string | null = null
  let hasCode = false
  let model = 'unknown'

  for (let i = 0; i < rawMessages.length; i++) {
    const m = rawMessages[i]
    const role = normalizeRole(m.role as ChatGPTExportMessage['author'])
    let content: string
    if (typeof m.content === 'string') {
      content = m.content
    } else if (m.content && typeof m.content === 'object' && Array.isArray(m.content.parts)) {
      content = m.content.parts.filter((p): p is string => typeof p === 'string').join('\n')
    } else {
      content = (m.content ?? '').toString()
    }
    if (!content.trim()) continue

    if (role === 'user' && firstUserSnippet == null) firstUserSnippet = content.slice(0, 200)
    if (content.includes('```')) hasCode = true

    messages.push({
      id: m.id ?? `${raw.id}-msg-${i}`,
      conversationId: raw.id,
      role,
      content: content.trim(),
      createdAt: m.create_time != null ? new Date(m.create_time * 1000) : new Date(),
      model: role === 'assistant' ? model : undefined,
    })
  }

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
    firstMessageSnippet: firstUserSnippet ?? undefined,
    hasCode,
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
