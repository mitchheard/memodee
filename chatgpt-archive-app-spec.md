# ChatGPT Archive — Cursor Build Spec

> A client-side web app to ingest, browse, search, and export your ChatGPT conversation history.
> No backend required except a lightweight serverless function for Notion API proxying.

---

## 1. Project Overview

**Goal**: Give ChatGPT power users a proper UI to explore, manage, and archive their exported conversation history — with semantic search, rich filtering, and integrations with Notion and Obsidian.

**Key Principles**:
- 100% client-side data processing. No user data ever leaves the browser.
- Parse once, persist in IndexedDB. No re-upload on return visits.
- Fast. Even exports with 1000+ conversations should feel snappy.
- Serverless-deployable (Vercel or Cloudflare Pages).

---

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React 18 + TypeScript | Component model, ecosystem |
| Build tool | Vite | Fast dev, optimized prod builds |
| Styling | Tailwind CSS + shadcn/ui | Rapid, consistent UI |
| State | Zustand | Simple global store, no boilerplate |
| Local persistence | Dexie.js (IndexedDB wrapper) | Typed, fast, async |
| Search | Fuse.js | Fuzzy search, no server needed |
| Semantic search | OpenAI `text-embedding-ada-002` | User provides own API key |
| ZIP parsing | JSZip | Client-side ZIP extraction |
| Markdown export | `unified` / `remark` pipeline | Clean MD rendering + generation |
| PDF export | `react-pdf` or `@react-pdf/renderer` | Client-side PDF |
| Notion integration | Notion API via serverless proxy | Avoid CORS / token exposure |
| Routing | React Router v6 | Simple SPA routing |
| Icons | Lucide React | Consistent, lightweight |

---

## 3. Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx         # Root layout: sidebar + main panel
│   │   │   ├── Sidebar.tsx          # Conversation list + filters
│   │   │   └── TopBar.tsx           # Search bar, global actions
│   │   ├── import/
│   │   │   ├── DropZone.tsx         # Drag-and-drop ZIP intake
│   │   │   └── ImportProgress.tsx   # Parsing progress indicator
│   │   ├── conversations/
│   │   │   ├── ConversationList.tsx # Virtualized list of convos
│   │   │   ├── ConversationItem.tsx # Single row: title, date, model tag
│   │   │   ├── ConversationView.tsx # Threaded message reader
│   │   │   └── MessageBubble.tsx    # Single message with role styling
│   │   ├── search/
│   │   │   ├── SearchBar.tsx        # Fuzzy + semantic toggle
│   │   │   └── SearchResults.tsx    # Highlighted results list
│   │   ├── filters/
│   │   │   └── FilterPanel.tsx      # Date range, model, tags, starred
│   │   ├── actions/
│   │   │   ├── ExportMenu.tsx       # MD / PDF / Obsidian export options
│   │   │   └── NotionExport.tsx     # Notion database picker + push
│   │   ├── analytics/
│   │   │   └── Dashboard.tsx        # Usage stats, charts
│   │   └── settings/
│   │       └── SettingsModal.tsx    # API keys, Notion token, preferences
│   ├── lib/
│   │   ├── parser.ts                # Parse conversations.json into typed records
│   │   ├── db.ts                    # Dexie schema and query helpers
│   │   ├── search.ts                # Fuse.js index builder + query
│   │   ├── embeddings.ts            # OpenAI embedding calls + cosine similarity
│   │   ├── exportMarkdown.ts        # Conversation → Markdown string
│   │   ├── exportPDF.ts             # Conversation → PDF blob
│   │   ├── exportObsidian.ts        # MD + frontmatter for Obsidian vault
│   │   └── notion.ts                # Notion API client (calls serverless proxy)
│   ├── store/
│   │   ├── useConversationStore.ts  # Active conversation, selection state
│   │   ├── useFilterStore.ts        # Filter/search state
│   │   └── useSettingsStore.ts      # API keys, preferences (localStorage)
│   ├── hooks/
│   │   ├── useConversations.ts      # Dexie query hook
│   │   ├── useSearch.ts             # Fuse + semantic search orchestration
│   │   └── useImport.ts             # ZIP parsing orchestration
│   ├── types/
│   │   └── index.ts                 # All shared TypeScript types
│   ├── pages/
│   │   ├── Home.tsx                 # Import screen (first run)
│   │   ├── Library.tsx              # Main browse/search view
│   │   ├── Analytics.tsx            # Dashboard page
│   │   └── Settings.tsx             # Settings page
│   └── api/                         # Serverless functions (Vercel)
│       └── notion-proxy.ts          # Proxies Notion API calls server-side
├── vite.config.ts
├── tailwind.config.ts
└── .env.example
```

---

## 4. Data Model

### ChatGPT Export Format
The export is a ZIP containing `conversations.json`:
```json
[
  {
    "id": "uuid",
    "title": "Conversation title",
    "create_time": 1700000000,
    "update_time": 1700001000,
    "mapping": {
      "node-id": {
        "id": "node-id",
        "message": {
          "id": "msg-id",
          "author": { "role": "user" | "assistant" | "system" | "tool" },
          "content": { "content_type": "text", "parts": ["..."] },
          "create_time": 1700000000,
          "metadata": { "model_slug": "gpt-4", ... }
        },
        "parent": "parent-node-id",
        "children": ["child-node-id"]
      }
    }
  }
]
```

### Internal App Types (`src/types/index.ts`)
```typescript
interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  model: string;              // extracted from first assistant message metadata
  tags: string[];             // user-assigned or auto-generated
  isStarred: boolean;
  isArchived: boolean;
  summary?: string;           // AI-generated, optional
  embeddingId?: string;       // reference to stored embedding
}

interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;            // flattened from parts array
  createdAt: Date;
  model?: string;
  tokenEstimate?: number;
}

interface ConversationEmbedding {
  conversationId: string;
  vector: number[];           // 1536-dim from ada-002
}

interface AppSettings {
  openAIKey?: string;
  notionToken?: string;
  notionDatabaseId?: string;
  defaultExportFormat: 'markdown' | 'pdf' | 'obsidian';
  theme: 'light' | 'dark' | 'system';
}
```

### Dexie Schema (`src/lib/db.ts`)
```typescript
class AppDB extends Dexie {
  conversations!: Table<Conversation>;
  messages!: Table<Message>;
  embeddings!: Table<ConversationEmbedding>;

  constructor() {
    super('ChatGPTArchive');
    this.version(1).stores({
      conversations: 'id, createdAt, updatedAt, model, isStarred, isArchived',
      messages: 'id, conversationId, role, createdAt',
      embeddings: 'conversationId',
    });
  }
}
```

---

## 5. Core Features — Implementation Notes

### 5.1 Import Flow (`src/hooks/useImport.ts`)
1. User drops ZIP onto `<DropZone />`
2. JSZip extracts `conversations.json`
3. `parser.ts` walks the `mapping` tree (linked list structure) to produce a flat, ordered `Message[]` array per conversation
4. Write all `Conversation` and `Message` records to Dexie in a single transaction (batch insert)
5. Build Fuse.js index from conversation titles and first 200 chars of first user message
6. Show progress bar during parsing — do in chunks to avoid blocking the UI thread (use `setTimeout` or a Web Worker)

**Edge cases to handle**:
- Conversations with no messages (skip)
- Messages with `content_type` of `multimodal_text` (flatten text parts, note image was present)
- Branched conversations (ChatGPT allows editing — follow the `children[0]` path by default, optionally expose branches)
- Very large exports (5000+ conversations) — chunk DB writes in batches of 100

### 5.2 Conversation List (`src/components/conversations/ConversationList.tsx`)
- Use `react-window` or `@tanstack/virtual` for virtualized rendering — critical for large exports
- Each row shows: title, relative date, model badge (GPT-4, GPT-4o, etc.), message count, star toggle
- Clicking selects and opens in the right panel
- Supports multi-select (checkbox on hover) for bulk delete or bulk export

### 5.3 Search (`src/lib/search.ts`)

**Fuzzy Search** (default, no API key required):
- Fuse.js index over `title + firstMessageSnippet`
- Results ranked by score, highlighted with `<mark>` tags
- Instant, runs on every keystroke with 150ms debounce

**Semantic Search** (requires OpenAI key):
- On demand: embed all conversations (batch calls to `text-embedding-ada-002`)
- Store vectors in Dexie `embeddings` table
- At query time: embed the query string, compute cosine similarity against all stored vectors
- Sort results by similarity score
- Show a toggle in the search bar: `Fuzzy | Semantic`
- Indicate embedding progress (e.g. "Indexing 450/1200 conversations...")

### 5.4 Filters (`src/components/filters/FilterPanel.tsx`)
Collapsible sidebar panel with:
- **Date range**: date picker, presets (Last 30 days, Last 6 months, This year, All time)
- **Model**: checkbox list of detected models in the dataset (GPT-3.5, GPT-4, GPT-4o, o1, etc.)
- **Tags**: multi-select from user-assigned tags
- **Starred only**: toggle
- **Has code**: toggle (filter convos where any message contains a code block)
- **Min message count**: slider

All filters compose with AND logic and update the conversation list in real time via Zustand store + Dexie query.

### 5.5 Conversation View (`src/components/conversations/ConversationView.tsx`)
- Render messages in thread order
- User messages: right-aligned or distinctly styled
- Assistant messages: markdown rendered (use `react-markdown` + `rehype-highlight` for code blocks with syntax highlighting)
- Show model badge per assistant turn (model can change mid-conversation)
- Action bar at top: Star, Tag, Delete, Export dropdown, Share to Notion
- Copy button on each message
- "Jump to top / bottom" for long conversations

### 5.6 Markdown Export (`src/lib/exportMarkdown.ts`)
```markdown
# {Conversation Title}

**Date**: {createdAt}
**Model**: {model}
**Messages**: {count}
**Tags**: {tags}

---

## User

{message content}

---

## Assistant

{message content}

---
```
- Preserve code blocks with language hints
- Download as `.md` file via blob URL

### 5.7 Obsidian Export (`src/lib/exportObsidian.ts`)
Same as markdown but with YAML frontmatter:
```yaml
---
title: "{title}"
date: {ISO date}
model: {model}
tags: [{tags}]
source: chatgpt
---
```

### 5.8 Notion Integration

**Setup** (in Settings):
- User enters a Notion Internal Integration Token
- User enters or picks a Notion Database ID
- App validates both by calling the proxy

**Export flow**:
1. User clicks "Share to Notion" in the conversation action bar
2. `notion.ts` calls `POST /api/notion-proxy` with conversation data
3. Serverless function calls Notion API to create a new Page in the target database
4. Page structure:
   - **Title**: conversation title
   - **Properties**: Date, Model, Message Count, Tags (multi-select), Source ("ChatGPT Archive")
   - **Body**: Full conversation as Notion blocks (paragraph blocks for messages, code blocks for code)
5. Return the created page URL and show a toast with a "Open in Notion" link

**`api/notion-proxy.ts`** (Vercel serverless):
```typescript
// Receives: { token, databaseId, conversation }
// Calls: Notion API POST /v1/pages
// Returns: { pageId, url }
// Purpose: keeps the Notion token server-side only
```

### 5.9 Delete
- Single conversation: confirmation dialog → delete from `conversations` + all `messages` + `embeddings` in Dexie
- Bulk delete: multi-select → single confirmation → batch delete
- Soft delete option: mark `isArchived: true` instead, hide from main list, accessible via "Archive" filter

### 5.10 Analytics Dashboard (`src/pages/Analytics.tsx`)
Compute from Dexie on page load:
- Total conversations, total messages, estimated tokens (rough: chars / 4)
- Activity heatmap (GitHub-style grid) — messages per day
- Model usage pie chart
- Messages per month bar chart
- Top conversation lengths
- First conversation date ("You've been using ChatGPT for X days")

Use `recharts` for all charts.

---

## 6. Additional Features (Phase 2+)

### AI-Assisted Summaries
- Settings: OpenAI API key
- On demand per conversation: call `gpt-4o-mini` to generate a 2-sentence summary
- Store in `conversations.summary`, shown in the list view as a subtitle

### Auto-Tagging
- After import, optionally run a lightweight keyword extraction pass
- Or call `gpt-4o-mini` with a list of candidate tags: ["coding", "writing", "math", "research", "debugging", etc.]
- Store tags on each conversation

### Cross-Conversation Q&A
- Input: a natural language question ("When did I last work on my portfolio site?")
- Embed the question, find top-5 semantically similar conversations
- Pass those conversation snippets as context to GPT and return a synthesized answer
- Think of it as RAG over your own conversation history

### Redaction Tool
- Before sharing/exporting, let users highlight and redact sensitive text
- Simple: find-and-replace with `[REDACTED]` before export

### Duplicate Detection
- Hash the first user message of each conversation
- Flag conversations with identical or near-identical openers

---

## 7. UI/UX Design Direction

**Aesthetic**: Dark-first, editorial/archival feel. Think a well-designed read-it-later app (Readwise, Matter) crossed with a dev tool. Monospace accents, generous whitespace, subtle borders rather than heavy shadows.

**Color palette**:
- Background: `#0f0f0f` / `#1a1a1a`
- Surface: `#1e1e1e` / `#252525`
- Border: `#2e2e2e`
- Text primary: `#e8e8e8`
- Text secondary: `#888`
- Accent: `#4ade80` (green) or `#60a5fa` (blue) — pick one, use sparingly

**Typography**:
- UI: `Geist` or `IBM Plex Sans`
- Code blocks: `JetBrains Mono` or `Berkeley Mono`
- Conversation reader: slightly larger, comfortable reading size (~16-17px), generous line height

**Key UX moments**:
- First load / empty state: clean drop zone, no clutter
- After import: satisfying count animation ("1,247 conversations imported")
- Search: results appear inline, no page jump
- Export: instant download, toast confirmation
- Notion: link to created page in toast

---

## 8. Environment Variables

```env
# Client (exposed to browser — public only)
VITE_APP_NAME=ChatGPT Archive

# Server (Vercel serverless — never exposed to client)
# Note: Notion token is passed per-request from client to proxy,
# stored only in the user's localStorage. Proxy validates and forwards.
```

---

## 9. Deployment

**Recommended: Vercel**
- Static site for all React pages
- `/api/notion-proxy.ts` auto-detected as a serverless function
- `vercel.json` not required for default config

**Alternative: Cloudflare Pages + Workers**
- Workers handles the Notion proxy
- Slightly faster edge delivery

---

## 10. Build Order for Cursor

Work in this sequence to always have a runnable app at each step:

1. **Scaffold** — Vite + React + TS + Tailwind + shadcn/ui + routing
2. **Import** — DropZone + parser + Dexie schema + write to DB
3. **Browse** — Sidebar conversation list (no virtualization yet) + basic conversation view
4. **Search** — Fuse.js index + search bar + filtering
5. **Actions** — Delete, Markdown export, Obsidian export
6. **Virtualization** — react-window on the list for performance
7. **Notion** — Settings modal + serverless proxy + export flow
8. **Analytics** — Dashboard with recharts
9. **Semantic search** — Embeddings pipeline (gated on OpenAI key in settings)
10. **Polish** — Animations, keyboard shortcuts, dark/light toggle, empty states, error boundaries

---

## 11. Key Gotchas & Notes for Cursor

- The ChatGPT `mapping` object is a **graph, not an array**. You must walk from the root node following `children[0]` to reconstruct message order. Find the root by finding the node whose `parent` is `null`.
- Some messages have `null` content or empty `parts` arrays — skip them.
- `create_time` is a Unix timestamp in **seconds**, not milliseconds. Multiply by 1000 for JS `Date`.
- Model info is in `message.metadata.model_slug` on assistant messages. It won't be on user messages.
- The Notion API has a **2000 character limit per text block**. Split long messages into multiple paragraph blocks.
- For embedding 1000+ conversations, batch calls to avoid rate limits. Use a queue with a ~100ms delay between batches of 20.
- Dexie transactions have size limits — insert messages in batches of 500 per transaction for large exports.
