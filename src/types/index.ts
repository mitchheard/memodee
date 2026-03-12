export interface Conversation {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  messageCount: number
  model: string
  tags: string[]
  isStarred: boolean
  isArchived: boolean
  summary?: string
  embeddingId?: string
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  createdAt: Date
  model?: string
  tokenEstimate?: number
}

export interface ConversationEmbedding {
  conversationId: string
  vector: number[]
}

export interface AppSettings {
  openAIKey?: string
  notionToken?: string
  notionDatabaseId?: string
  defaultExportFormat: 'markdown' | 'pdf' | 'obsidian'
  theme: 'light' | 'dark' | 'system'
}

// Raw ChatGPT export types (conversations.json)
export interface ChatGPTExportMessage {
  id?: string
  author?: { role: 'user' | 'assistant' | 'system' | 'tool' }
  content?: {
    content_type: string
    parts?: string[]
  }
  create_time?: number
  metadata?: { model_slug?: string; [key: string]: unknown }
}

export interface ChatGPTExportNode {
  id: string
  message?: ChatGPTExportMessage | null
  parent?: string | null
  children?: string[] | null
}

export interface ChatGPTExportConversation {
  id: string
  title: string
  create_time: number
  update_time: number
  mapping?: Record<string, ChatGPTExportNode>
}
