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
          <main className="flex flex-1 flex-col min-h-0 overflow-hidden">
            <div className="flex min-h-0 flex-1 flex-col overflow-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
