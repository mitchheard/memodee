import { NavLink, useLocation } from 'react-router-dom'
import { ConversationList } from '@/components/conversations/ConversationList'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/filters/FilterPanel'
import { Library, BarChart3, Settings as SettingsIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSearchContext } from '@/contexts/SearchContext'
import { useSettingsStore } from '@/store/useSettingsStore'

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 64 64" fill="none" aria-hidden>
      <rect width="64" height="64" rx="14" fill="#7F77DD" />
      <rect x="14" y="22" width="36" height="5" rx="2.5" fill="white" opacity="0.9" />
      <rect x="14" y="31" width="28" height="5" rx="2.5" fill="white" opacity="0.55" />
      <rect x="14" y="40" width="18" height="5" rx="2.5" fill="white" opacity="0.25" />
    </svg>
  )
}

function ImportNavIcon({ className }: { className?: string }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 15 15"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <path
        d="M7.5 2v7M7.5 2L5 4.5M7.5 2L10 4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 10v2.5a.5.5 0 00.5.5h10a.5.5 0 00.5-.5V10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Sidebar() {
  const location = useLocation()
  const isLibrary = location.pathname === '/library'
  const searchContext = useSearchContext()
  const openAIKey = useSettingsStore((s) => s.openAIKey)

  const navLinkClass = (isActive: boolean) =>
    cn(
      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
      isActive
        ? 'bg-sidebar-accent text-sidebar-accent-foreground dark:bg-[rgba(127,119,221,0.18)] dark:text-white'
        : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground dark:text-[rgba(255,255,255,0.45)] dark:hover:bg-white/[0.08] dark:hover:text-white'
    )

  return (
    <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center gap-[9px] px-[18px] pt-5 pb-4 border-b-[0.5px] border-sidebar-border dark:border-white/[0.08]">
        <LogoMark />
        <span className="text-[15px] font-medium tracking-[-0.2px] text-sidebar-foreground">Memodee</span>
      </div>
      <nav className="flex flex-col gap-0.5 p-2 border-b border-sidebar-border">
        <NavLink to="/" className={(o) => navLinkClass(o.isActive)}>
          <ImportNavIcon />
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
            <FilterPanel />
            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
              <ConversationList />
            </div>
          </>
        ) : (
          <div className="flex-1 min-h-0" />
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
