import { describe, it, expect } from 'vitest'
import { escapeHtml, buildConversationPrintHtml } from './exportPrintPdf'
import type { Conversation, Message } from '@/types'

function conv(partial: Partial<Conversation> = {}): Conversation {
  const now = new Date('2024-06-01T12:00:00Z')
  return {
    id: 'c1',
    title: 'Test',
    createdAt: now,
    updatedAt: now,
    messageCount: 1,
    model: 'gpt-4',
    tags: ['a'],
    isStarred: false,
    isArchived: false,
    ...partial,
  }
}

function msg(partial: Partial<Message> = {}): Message {
  const now = new Date('2024-06-01T12:01:00Z')
  return {
    id: 'm1',
    conversationId: 'c1',
    role: 'user',
    content: 'Hello',
    createdAt: now,
    ...partial,
  }
}

describe('escapeHtml', () => {
  it('escapes special characters', () => {
    expect(escapeHtml('<script>')).toBe('&lt;script&gt;')
    expect(escapeHtml('a & b')).toBe('a &amp; b')
    expect(escapeHtml('"q"')).toBe('&quot;q&quot;')
  })
})

describe('buildConversationPrintHtml', () => {
  it('escapes title and meta in the document', () => {
    const html = buildConversationPrintHtml(conv({ title: '<img onerror=x>', model: 'm"y' }), [msg()])
    expect(html).toContain('&lt;img onerror=x&gt;')
    expect(html).not.toContain('<img onerror=x>')
    expect(html).toContain('m&quot;y')
  })

  it('includes rendered markdown body', () => {
    const html = buildConversationPrintHtml(conv({ title: 'Doc' }), [
      msg({ role: 'assistant', content: '**bold**' }),
    ])
    expect(html).toContain('<strong')
    expect(html).toContain('bold')
  })
})
