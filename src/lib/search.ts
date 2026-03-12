import Fuse from 'fuse.js'
import type { Conversation } from '@/types'

export interface SearchableConversation {
  id: string
  title: string
  firstMessageSnippet: string
}

const FUSE_OPTIONS = {
  keys: [
    { name: 'title', weight: 1 },
    { name: 'firstMessageSnippet', weight: 0.7 },
  ],
  threshold: 0.3,
  includeScore: true,
  includeMatches: true,
}

export function buildSearchIndex(conversations: Conversation[]): Fuse<SearchableConversation> {
  const searchable: SearchableConversation[] = conversations.map((c) => ({
    id: c.id,
    title: c.title,
    firstMessageSnippet: c.firstMessageSnippet ?? '',
  }))
  return new Fuse(searchable, FUSE_OPTIONS)
}

export interface SearchMatch {
  key: 'title' | 'firstMessageSnippet'
  indices: [number, number][]
}

export interface SearchResult {
  conversation: Conversation
  score: number
  matches: SearchMatch[]
}

export function searchConversations(
  fuse: Fuse<SearchableConversation>,
  query: string,
  conversationsById: Map<string, Conversation>
): SearchResult[] {
  if (!query.trim()) {
    return Array.from(conversationsById.values()).map((c) => ({
      conversation: c,
      score: 0,
      matches: [] as SearchMatch[],
    }))
  }
  const results = fuse.search(query)
  return results.map((r) => {
    const matches: SearchMatch[] = (r.matches ?? []).map((m) => ({
      key: m.key as 'title' | 'firstMessageSnippet',
      indices: (m.indices ?? []) as [number, number][],
    }))
    const conv = conversationsById.get(r.item.id)
    return {
      conversation: conv!,
      score: r.score ?? 1,
      matches,
    }
  }).filter((r) => r.conversation != null)
}

/**
 * Apply a list of character indices to a string, wrapping matched ranges in <mark>.
 */
export function highlightMatches(text: string, indices: [number, number][]): string {
  if (!indices.length) return text
  const sorted = [...indices].sort((a, b) => a[0] - b[0])
  const parts: string[] = []
  let lastEnd = 0
  for (const [start, end] of sorted) {
    if (start > lastEnd) {
      parts.push(text.slice(lastEnd, start))
    }
    parts.push('<mark>', text.slice(start, end + 1), '</mark>')
    lastEnd = end + 1
  }
  if (lastEnd < text.length) {
    parts.push(text.slice(lastEnd))
  }
  return parts.join('')
}
