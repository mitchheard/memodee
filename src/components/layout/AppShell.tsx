import { Outlet } from 'react-router-dom'
import { SearchProvider } from '@/contexts/SearchContext'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export function AppShell() {
  return (
    <SearchProvider>
      <div className="h-screen overflow-hidden bg-background text-foreground flex">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden">
          <Navbar />
          <main className="flex-1 min-h-0 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
