import { Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { useThemeStore } from '@/store/useThemeStore'
import { Button } from '@/components/ui/button'

const PAGE_TITLES: Record<string, string> = {
  '/': 'ChatGPT Archive',
  '/library': 'Library',
  '/settings': 'Settings',
}

export function Navbar() {
  const location = useLocation()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const title = PAGE_TITLES[location.pathname] ?? 'ChatGPT Archive'

  return (
    <header className="h-12 shrink-0 border-b border-border bg-background flex items-center justify-between px-4">
      <h1 className="text-sm font-medium text-foreground truncate">
        {title}
      </h1>
      <Button
        variant="ghost"
        size="icon"
        className="shrink-0"
        onClick={toggleTheme}
        aria-label="Toggle light/dark mode"
      >
        {theme === 'dark' ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )}
      </Button>
    </header>
  )
}
