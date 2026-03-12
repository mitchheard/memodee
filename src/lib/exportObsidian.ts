import type { Conversation, Message } from '@/types'
import { conversationToMarkdown } from './exportMarkdown'

function formatISODate(d: Date): string {
  return d.toISOString()
}

function frontmatter(conversation: Conversation): string {
  const tags = conversation.tags?.length
    ? conversation.tags.map((t) => (t.includes(' ') ? `"${t}"` : t)).join(', ')
    : ''
  const lines = [
    '---',
    `title: "${(conversation.title || 'Untitled').replace(/"/g, '\\"')}"`,
    `date: ${formatISODate(conversation.createdAt)}`,
    `model: ${conversation.model}`,
    `tags: [${tags}]`,
    'source: chatgpt',
    '---',
    '',
  ]
  return lines.join('\n')
}

export function conversationToObsidian(conversation: Conversation, messages: Message[]): string {
  return frontmatter(conversation) + conversationToMarkdown(conversation, messages).replace(/^# .+\n\n/, '')
}

export function downloadObsidian(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`
  a.click()
  URL.revokeObjectURL(url)
}
