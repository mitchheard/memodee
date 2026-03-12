import { Outlet } from 'react-router-dom'

export function AppShell() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
