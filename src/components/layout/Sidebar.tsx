import { NavLink, Link, useLocation } from 'react-router-dom'
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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground'
    )

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-card flex flex-col h-full min-h-0 overflow-hidden">
      <nav className="flex flex-col gap-0.5 p-2 border-b border-sidebar-border">
        <NavLink to="/" className={(o) => navLinkClass(o.isActive)}>
          <FileArchive className="size-4 shrink-0" aria-hidden />
          <span className="truncate">Import</span>
        </NavLink>
        <NavLink to="/library" className={(o) => navLinkClass(o.isActive)}>
          <Library className="size-4 shrink-0" aria-hidden />
          <span className="truncate">Library</span>
        </NavLink>
        <NavLink to="/analytics" className={(o) => navLinkClass(o.isActive)}>
          <BarChart3 className="size-4 shrink-0" aria-hidden />
          <span className="truncate">Analytics</span>
        </NavLink>
      </nav>
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {isLibrary ? (
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
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <ConversationList />
            </div>
          </>
        ) : (
          <div className="flex-1 p-3 text-sm text-muted-foreground">
            <p>Go to <Link to="/library" className="font-medium text-foreground hover:underline">Library</Link> to browse and search your conversations.</p>
          </div>
        )}
      </div>
      <nav className="p-2 border-t border-sidebar-border">
        <NavLink to="/settings" className={(o) => navLinkClass(o.isActive)}>
          <SettingsIcon className="size-4 shrink-0" aria-hidden />
          <span className="truncate">Settings</span>
        </NavLink>
      </nav>
    </aside>
  )
}
