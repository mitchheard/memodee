import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/useThemeStore'
import { Button } from '@/components/ui/button'

export function Navbar() {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <header className="h-12 shrink-0 border-b border-border bg-background flex items-center justify-end px-4">
      <Button
        variant="ghost"
        size="icon"
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
