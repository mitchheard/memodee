import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import { cn } from '@/lib/utils'

const markdownComponents: Components = {
  p: ({ children, ...props }) => (
    <p className="mb-2 last:mb-0 leading-relaxed break-words" {...props}>
      {children}
    </p>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }) => (
    <em className="italic" {...props}>
      {children}
    </em>
  ),
  h1: ({ children, ...props }) => (
    <h1 className="mt-3 mb-2 text-base font-semibold leading-snug first:mt-0 break-words" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="mt-3 mb-2 text-[0.9375rem] font-semibold leading-snug first:mt-0 break-words" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="mt-2 mb-1.5 text-sm font-semibold leading-snug first:mt-0 break-words" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="mt-2 mb-1 text-sm font-medium leading-snug first:mt-0 break-words" {...props}>
      {children}
    </h4>
  ),
  h5: ({ children, ...props }) => (
    <h5 className="mt-2 mb-1 text-sm font-medium leading-snug first:mt-0 break-words" {...props}>
      {children}
    </h5>
  ),
  h6: ({ children, ...props }) => (
    <h6 className="mt-2 mb-1 text-sm font-medium leading-snug first:mt-0 break-words" {...props}>
      {children}
    </h6>
  ),
  hr: (props) => <hr className="my-3 border-0 border-t border-border/50" {...props} />,
  ul: ({ children, ...props }) => (
    <ul className="my-2 list-disc space-y-1 pl-5 break-words" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="my-2 list-decimal space-y-1 pl-5 break-words" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="leading-relaxed [&>p]:mb-1 [&>p:last-child]:mb-0" {...props}>
      {children}
    </li>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="my-2 border-l-2 border-border/60 pl-3 text-muted-foreground [&_p]:mb-1 [&_p:last-child]:mb-0"
      {...props}
    >
      {children}
    </blockquote>
  ),
  a: ({ children, href, ...props }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 break-all hover:opacity-90"
      target="_blank"
      rel="noopener noreferrer"
      {...props}
    >
      {children}
    </a>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="my-2 overflow-x-auto rounded-md border border-border/40 bg-background/60 p-3 text-[0.8125rem] leading-relaxed [&>code]:block [&>code]:w-full [&>code]:min-w-0 [&>code]:whitespace-pre-wrap [&>code]:break-words [&>code]:bg-transparent [&>code]:p-0 [&>code]:font-mono"
      {...props}
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => (
    <code
      className={cn(
        'rounded bg-background/60 px-1 py-0.5 font-mono text-[0.8125rem] break-words',
        className
      )}
      {...props}
    >
      {children}
    </code>
  ),
  table: ({ children, ...props }) => (
    <div className="my-2 max-w-full overflow-x-auto">
      <table className="w-full min-w-0 border-collapse border border-border/50 text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...props }) => <thead className="bg-background/40" {...props}>{children}</thead>,
  tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
  tr: ({ children, ...props }) => <tr className="border-b border-border/40 last:border-b-0" {...props}>{children}</tr>,
  th: ({ children, ...props }) => (
    <th className="border border-border/40 px-2 py-1.5 text-left font-medium" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border/40 px-2 py-1.5 align-top break-words" {...props}>
      {children}
    </td>
  ),
}

interface MessageMarkdownProps {
  content: string
  className?: string
}

export function MessageMarkdown({ content, className }: MessageMarkdownProps) {
  return (
    <div className={cn('min-w-0 max-w-full text-sm leading-relaxed', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
