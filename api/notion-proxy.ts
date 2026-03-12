/**
 * Vercel serverless proxy for Notion API.
 * Receives: { token, databaseId, conversation, messages }
 * Creates a page in the database and returns { pageId, url }
 * Keeps the Notion token server-side only.
 */

const NOTION_VERSION = '2022-06-28'
const MAX_BLOCK_CHARS = 2000

type NotionRichText = { type: 'text'; text: { content: string } }
type NotionBlock =
  | { object: 'block'; type: 'paragraph'; paragraph: { rich_text: NotionRichText[] } }
  | { object: 'block'; type: 'heading_2'; heading_2: { rich_text: NotionRichText[] } }
  | { object: 'block'; type: 'code'; code: { rich_text: NotionRichText[]; language: string } }

function chunkText(text: string, max = MAX_BLOCK_CHARS): string[] {
  const chunks: string[] = []
  let i = 0
  while (i < text.length) {
    chunks.push(text.slice(i, i + max))
    i += max
  }
  return chunks.length ? chunks : ['']
}

function richText(content: string): NotionRichText[] {
  return chunkText(content).map((c) => ({ type: 'text' as const, text: { content: c } }))
}

function buildBlocks(messages: { role: string; content: string }[]): NotionBlock[] {
  const blocks: NotionBlock[] = []
  for (const msg of messages) {
    const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1)
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: { rich_text: richText(`${role}:`) },
    })
    const content = msg.content || ''
    if (content.includes('```')) {
      const parts = content.split(/(```[\s\S]*?```)/g)
      for (const part of parts) {
        if (part.startsWith('```')) {
          const match = part.match(/```(\w*)\n?([\s\S]*?)```/)
          const lang = match?.[1] || 'plain text'
          const code = match?.[2]?.trim() || ''
          blocks.push({
            object: 'block',
            type: 'code',
            code: {
              rich_text: richText(code),
              language: lang || 'plain text',
            },
          })
        } else if (part.trim()) {
          for (const chunk of chunkText(part.trim())) {
            blocks.push({
              object: 'block',
              type: 'paragraph',
              paragraph: { rich_text: richText(chunk) },
            })
          }
        }
      }
    } else {
      for (const chunk of chunkText(content)) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: { rich_text: richText(chunk) },
        })
      }
    }
  }
  return blocks
}

interface ConversationPayload {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  messageCount: number
  model: string
  tags: string[]
}

interface MessagePayload {
  role: string
  content: string
}

interface RequestBody {
  token: string
  databaseId: string
  conversation: ConversationPayload
  messages: MessagePayload[]
}

export default async function handler(
  req: { method?: string; body?: string },
  res: { status: (n: number) => { json: (o: object) => void }; setHeader: (a: string, b: string) => void }
): Promise<void> {
  res.setHeader('Content-Type', 'application/json')
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }
  let body: RequestBody
  try {
    const raw = req.body
    body = (typeof raw === 'string' ? JSON.parse(raw || '{}') : raw ?? {}) as RequestBody
  } catch {
    res.status(400).json({ error: 'Invalid JSON' })
    return
  }
  const { token, databaseId, conversation, messages } = body
  if (!token || !databaseId || !conversation || !Array.isArray(messages)) {
    res.status(400).json({ error: 'Missing token, databaseId, conversation, or messages' })
    return
  }

  const blocks = buildBlocks(messages)
  const dbId = databaseId.replace(/-/g, '')
  const props: Record<string, unknown> = {
    Name: {
      title: [{ type: 'text', text: { content: (conversation.title || 'Untitled').slice(0, 2000) } }],
    },
  }
  try {
    const createRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: props,
        children: blocks.slice(0, 100),
      }),
    })
    if (!createRes.ok) {
      const err = await createRes.text()
      res.status(createRes.status).json({ error: err || 'Notion API error' })
      return
    }
    const page = (await createRes.json()) as { id: string; url?: string }
    const pageId = page.id
    const url = page.url ?? `https://notion.so/${pageId.replace(/-/g, '')}`

    if (blocks.length > 100) {
      const rest = blocks.slice(100)
      const appendRes = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': NOTION_VERSION,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ children: rest }),
      })
      if (!appendRes.ok) {
        res.status(200).json({
          pageId,
          url,
          warning: 'Page created but some content could not be appended',
        })
        return
      }
    }
    res.status(200).json({ pageId, url })
  } catch (e) {
    res.status(500).json({ error: e instanceof Error ? e.message : 'Unknown error' })
  }
}
