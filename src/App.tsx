import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { Library } from '@/pages/Library'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<Library />} />
      </Route>
    </Routes>
  )
}

export default App
