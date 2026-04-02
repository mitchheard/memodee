import type { Conversation, Message } from '@/types'
import { conversationToMarkdown, downloadMarkdown } from '@/lib/exportMarkdown'
import { conversationToObsidian, downloadObsidian } from '@/lib/exportObsidian'
import { printConversationAsPdf } from '@/lib/exportPrintPdf'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { FileDown } from 'lucide-react'

interface ExportMenuProps {
  conversation: Conversation
  messages: Message[]
  disabled?: boolean
}

function safeFilename(title: string): string {
  return title.replace(/[<>:"/\\|?*]/g, '_').replace(/\s+/g, ' ').trim() || 'export'
}

export function ExportMenu({ conversation, messages, disabled }: ExportMenuProps) {
  const handleMarkdown = () => {
    const md = conversationToMarkdown(conversation, messages)
    downloadMarkdown(md, `${safeFilename(conversation.title)}.md`)
  }

  const handleObsidian = () => {
    const content = conversationToObsidian(conversation, messages)
    downloadObsidian(content, `${safeFilename(conversation.title)}.md`)
  }

  const handlePdf = () => {
    const ok = printConversationAsPdf(conversation, messages)
    if (!ok) {
      toast.error('Could not open print window. Allow pop-ups for this site, then try again.')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={disabled}>
        <Button variant="outline" size="sm">
          <FileDown className="size-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleMarkdown}>Export as Markdown</DropdownMenuItem>
        <DropdownMenuItem onClick={handleObsidian}>Export as Obsidian</DropdownMenuItem>
        <DropdownMenuItem onClick={handlePdf}>Export as PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
