import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Global keyboard shortcuts:
 * - Cmd+K / Ctrl+K: focus search (navigate to Library if needed)
 */
export function KeyboardShortcuts() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (location.pathname !== '/library') {
          navigate('/library')
          setTimeout(() => document.getElementById('main-search')?.focus(), 100)
        } else {
          document.getElementById('main-search')?.focus()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [location.pathname, navigate])

  return null
}
