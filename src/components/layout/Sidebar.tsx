import { NavLink } from 'react-router-dom'
import { ConversationList } from '@/components/conversations/ConversationList'
import { FileArchive, Library } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sidebar() {
  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col min-h-screen">
      <nav className="p-2 border-b border-border flex gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
          }
        >
          <FileArchive className="size-4" />
          Import
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
          }
        >
          <Library className="size-4" />
          Library
        </NavLink>
      </nav>
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ConversationList />
      </div>
    </aside>
  )
}
