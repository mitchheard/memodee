import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  searchMode?: 'fuzzy' | 'semantic'
  onSearchModeChange?: (m: 'fuzzy' | 'semantic') => void
  needIndexing?: boolean
  isIndexing?: boolean
  indexProgress?: { current: number; total: number } | null
  onStartIndexing?: () => void
  hasOpenAIKey?: boolean
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search conversations…',
  className,
  searchMode = 'fuzzy',
  onSearchModeChange,
  needIndexing,
  isIndexing,
  indexProgress,
  onStartIndexing,
  hasOpenAIKey,
}: SearchBarProps) {
  const navigate = useNavigate()

  return (
    <div className={cn('space-y-2', className)}>
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-8 h-9"
          aria-label="Search conversations"
          disabled={isIndexing}
        />
      </div>
      {onSearchModeChange != null && (
        <div className="flex items-center gap-1">
          <Button
            variant={searchMode === 'fuzzy' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => onSearchModeChange('fuzzy')}
          >
            Fuzzy
          </Button>
          <Button
            variant={searchMode === 'semantic' ? 'secondary' : 'ghost'}
            size="sm"
            className="h-7 text-xs"
            onClick={() => {
              if (!hasOpenAIKey) {
                navigate('/settings')
                return
              }
              onSearchModeChange('semantic')
            }}
            title={!hasOpenAIKey ? 'Add OpenAI API key in Settings' : ''}
          >
            Semantic
          </Button>
        </div>
      )}
      {searchMode === 'semantic' && needIndexing && !isIndexing && onStartIndexing != null && hasOpenAIKey && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onStartIndexing}>
            Build semantic index
          </Button>
          <span className="text-xs text-muted-foreground">Required for semantic search</span>
        </div>
      )}
      {searchMode === 'semantic' && isIndexing && indexProgress != null && (
        <p className="text-xs text-muted-foreground">
          Indexing {indexProgress.current.toLocaleString()} / {indexProgress.total.toLocaleString()} conversations…
        </p>
      )}
    </div>
  )
}
