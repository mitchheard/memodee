import { NavLink, useLocation } from 'react-router-dom'
import { ConversationList } from '@/components/conversations/ConversationList'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { FileArchive, Library, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchContext } from '@/contexts/SearchContext'
import { useSettingsStore } from '@/store/useSettingsStore'

export function Sidebar() {
  const location = useLocation()
  const isLibrary = location.pathname === '/library'
  const searchContext = useSearchContext()
  const openAIKey = useSettingsStore((s) => s.openAIKey)

  return (
    <aside className="w-72 shrink-0 border-r border-border bg-card flex flex-col h-full min-h-0 overflow-hidden">
      <nav className="p-2 border-b border-border grid grid-cols-2 gap-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )
          }
        >
          <FileArchive className="size-4 shrink-0" />
          <span className="truncate">Import</span>
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )
          }
        >
          <Library className="size-4 shrink-0" />
          <span className="truncate">Library</span>
        </NavLink>
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )
          }
        >
          <BarChart3 className="size-4 shrink-0" />
          <span className="truncate">Analytics</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
            )
          }
        >
          <SettingsIcon className="size-4 shrink-0" />
          <span className="truncate">Settings</span>
        </NavLink>
      </nav>
      {isLibrary && (
        <>
          <div className="px-3 py-2.5 border-b border-border space-y-2">
            <SearchBar
              value={searchContext.searchQuery}
              onChange={searchContext.setSearchQuery}
              searchMode={searchContext.searchMode}
              onSearchModeChange={searchContext.setSearchMode}
              needIndexing={searchContext.needIndexing}
              isIndexing={searchContext.isIndexing}
              indexProgress={searchContext.indexProgress}
              onStartIndexing={() => searchContext.startIndexing(openAIKey ?? '')}
              hasOpenAIKey={!!openAIKey?.trim()}
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
