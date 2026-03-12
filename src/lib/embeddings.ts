const EMBEDDING_MODEL = 'text-embedding-ada-002'
const BATCH_SIZE = 20
const BATCH_DELAY_MS = 100

export async function embedTexts(apiKey: string, texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return []
  const input = texts.map((t) => t.slice(0, 8000))
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: { message?: string } }).error?.message ?? res.statusText)
  }
  const data = (await res.json()) as { data: Array<{ embedding: number[] }> }
  return data.data.map((d) => d.embedding)
}

export async function embedQuery(apiKey: string, query: string): Promise<number[]> {
  const vectors = await embedTexts(apiKey, [query.slice(0, 8000)])
  return vectors[0] ?? []
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0
  let dot = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  return denom === 0 ? 0 : dot / denom
}

export interface IndexProgress {
  current: number
  total: number
}

export async function indexConversations(
  apiKey: string,
  conversations: Array<{ id: string; title: string; firstMessageSnippet?: string }>,
  onProgress: (progress: IndexProgress) => void
): Promise<void> {
  const { db } = await import('@/lib/db')
  const total = conversations.length
  for (let i = 0; i < total; i += BATCH_SIZE) {
    const batch = conversations.slice(i, i + BATCH_SIZE)
    const texts = batch.map((c) => `${c.title}\n${c.firstMessageSnippet ?? ''}`.trim())
    const vectors = await embedTexts(apiKey, texts)
    const records = batch.map((c, j) => ({
      conversationId: c.id,
      vector: vectors[j] ?? [],
    }))
    await db.embeddings.bulkPut(records)
    onProgress({ current: Math.min(i + BATCH_SIZE, total), total })
    if (i + BATCH_SIZE < total) {
      await new Promise((r) => setTimeout(r, BATCH_DELAY_MS))
    }
  }
}
