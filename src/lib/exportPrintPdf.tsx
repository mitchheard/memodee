import { renderToStaticMarkup } from 'react-dom/server'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { Conversation, Message } from '@/types'

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function formatDate(d: Date): string {
  return d.toLocaleString()
}

const printMarkdownComponents: Components = {
  p: ({ children }) => <p style={{ margin: '0 0 8px', lineHeight: 1.55 }}>{children}</p>,
  strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
  em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
  h1: ({ children }) => (
    <h1 style={{ fontSize: '1.25rem', margin: '12px 0 8px', fontWeight: 600, lineHeight: 1.35 }}>{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 style={{ fontSize: '1.1rem', margin: '12px 0 6px', fontWeight: 600, lineHeight: 1.35 }}>{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 style={{ fontSize: '1rem', margin: '10px 0 6px', fontWeight: 600, lineHeight: 1.35 }}>{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 style={{ fontSize: '0.95rem', margin: '8px 0 4px', fontWeight: 600, lineHeight: 1.35 }}>{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 style={{ fontSize: '0.9rem', margin: '8px 0 4px', fontWeight: 600, lineHeight: 1.35 }}>{children}</h5>
  ),
  h6: ({ children }) => (
    <h6 style={{ fontSize: '0.875rem', margin: '8px 0 4px', fontWeight: 600, lineHeight: 1.35 }}>{children}</h6>
  ),
  hr: () => <hr style={{ border: 'none', borderTop: '1px solid #ccc', margin: '12px 0' }} />,
  ul: ({ children }) => <ul style={{ margin: '8px 0', paddingLeft: '1.25rem' }}>{children}</ul>,
  ol: ({ children }) => <ol style={{ margin: '8px 0', paddingLeft: '1.25rem' }}>{children}</ol>,
  li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
  blockquote: ({ children }) => (
    <blockquote
      style={{
        borderLeft: '3px solid #ccc',
        margin: '8px 0',
        paddingLeft: 12,
        color: '#444',
      }}
    >
      {children}
    </blockquote>
  ),
  a: ({ href, children, ...props }) => (
    <a href={href} style={{ color: '#1d4ed8' }} {...props}>
      {children}
    </a>
  ),
  pre: ({ children }) => (
    <pre
      style={{
        margin: '8px 0',
        padding: 12,
        background: '#f4f4f5',
        border: '1px solid #e4e4e7',
        borderRadius: 6,
        overflow: 'auto',
        fontSize: '0.8125rem',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        lineHeight: 1.45,
      }}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isFenced = Boolean(className?.startsWith('language-'))
    const style = isFenced
      ? {
          display: 'block' as const,
          background: 'transparent',
          padding: 0,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          whiteSpace: 'pre-wrap' as const,
          wordBreak: 'break-word' as const,
        }
      : {
          background: '#f4f4f5',
          padding: '1px 5px',
          borderRadius: 4,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.9em',
        }
    return (
      <code className={className} style={style} {...props}>
        {children}
      </code>
    )
  },
  table: ({ children }) => (
    <div style={{ margin: '8px 0', overflowX: 'auto' as const }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse' as const,
          border: '1px solid #d4d4d8',
          fontSize: '0.875rem',
        }}
      >
        {children}
      </table>
    </div>
  ),
  thead: ({ children }) => <thead style={{ background: '#f4f4f5' }}>{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr style={{ borderBottom: '1px solid #e4e4e7' }}>{children}</tr>,
  th: ({ children }) => (
    <th style={{ border: '1px solid #d4d4d8', padding: '6px 8px', textAlign: 'left', fontWeight: 600 }}>
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td style={{ border: '1px solid #d4d4d8', padding: '6px 8px', verticalAlign: 'top', wordBreak: 'break-word' as const }}>
      {children}
    </td>
  ),
}

function messageContentToPrintHtml(content: string): string {
  return renderToStaticMarkup(
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={printMarkdownComponents}>
      {content}
    </ReactMarkdown>
  )
}

export function buildConversationPrintHtml(conversation: Conversation, messages: Message[]): string {
  const title = conversation.title || 'Untitled'
  const tagsLine = conversation.tags?.length ? conversation.tags.join(', ') : '—'

  const messagesHtml = messages
    .map((msg) => {
      const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1)
      const body = messageContentToPrintHtml(msg.content)
      return `<section class="message" aria-label="${escapeHtml(role)}">
  <div class="role">${escapeHtml(role)}</div>
  <div class="body">${body}</div>
</section>`
    })
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { margin: 16mm; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #18181b;
      background: #fff;
      margin: 0;
      padding: 0;
    }
    h1.doc-title { font-size: 1.5rem; margin: 0 0 12px; font-weight: 600; }
    .meta { color: #52525b; font-size: 10pt; margin-bottom: 20px; line-height: 1.5; }
    .meta div { margin-bottom: 2px; }
    .message { margin-bottom: 22px; page-break-inside: avoid; }
    .role { font-size: 9pt; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; color: #71717a; margin-bottom: 6px; }
    .body { font-size: 10.5pt; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <h1 class="doc-title">${escapeHtml(title)}</h1>
  <div class="meta">
    <div><strong>Date</strong>: ${escapeHtml(formatDate(conversation.createdAt))}</div>
    <div><strong>Model</strong>: ${escapeHtml(conversation.model)}</div>
    <div><strong>Messages</strong>: ${String(conversation.messageCount)}</div>
    <div><strong>Tags</strong>: ${escapeHtml(tagsLine)}</div>
  </div>
  ${messagesHtml}
</body>
</html>`
}

/** Opens a print dialog; user can choose "Save as PDF" as the destination. */
export function printConversationAsPdf(conversation: Conversation, messages: Message[]): boolean {
  const html = buildConversationPrintHtml(conversation, messages)
  const w = window.open('', '_blank', 'noopener,noreferrer')
  if (!w) return false
  w.document.open()
  w.document.write(html)
  w.document.close()
  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    w.focus()
    w.print()
  }
  w.onload = runPrint
  setTimeout(runPrint, 250)
  w.addEventListener('afterprint', () => {
    w.close()
  })
  return true
}
