import { NavLink, useLocation } from 'react-router-dom'
import { ConversationList } from '@/components/conversations/ConversationList'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { FileArchive, Library, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFilterStore } from '@/store/useFilterStore'

export function Sidebar() {
  const location = useLocation()
  const isLibrary = location.pathname === '/library'
  const searchQuery = useFilterStore((s) => s.searchQuery)
  const setSearchQuery = useFilterStore((s) => s.setSearchQuery)

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col h-full min-h-0 overflow-hidden">
      <nav className="px-3 py-2.5 border-b border-border flex gap-1">
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
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
          }
        >
          <BarChart3 className="size-4" />
          Analytics
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )
          }
        >
          <SettingsIcon className="size-4" />
          Settings
        </NavLink>
      </nav>
      {isLibrary && (
        <>
          <div className="px-3 py-2.5 border-b border-border">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
            />
          </div>
          <FilterPanel defaultOpen={true} />
        </>
      )}
      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <ConversationList />
      </div>
    </aside>
  )
}
