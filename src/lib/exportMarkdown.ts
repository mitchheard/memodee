import type { Conversation, Message } from '@/types'

function formatDate(d: Date): string {
  return d.toLocaleString()
}

function escapeMarkdownBlock(content: string): string {
  return content
}

export function conversationToMarkdown(conversation: Conversation, messages: Message[]): string {
  const lines: string[] = [
    `# ${conversation.title || 'Untitled'}`,
    '',
    `**Date**: ${formatDate(conversation.createdAt)}`,
    `**Model**: ${conversation.model}`,
    `**Messages**: ${conversation.messageCount}`,
    `**Tags**: ${conversation.tags?.length ? conversation.tags.join(', ') : '—'}`,
    '',
    '---',
    '',
  ]

  for (const msg of messages) {
    const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1)
    lines.push(`## ${role}`, '', escapeMarkdownBlock(msg.content), '', '---', '')
  }

  return lines.join('\n')
}

export function downloadMarkdown(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.md') ? filename : `${filename}.md`
  a.click()
  URL.revokeObjectURL(url)
}
