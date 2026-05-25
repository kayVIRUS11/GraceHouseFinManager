import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Students from './pages/Students.jsx'
import Admin from './pages/Admin.jsx'
import PendingReceipts from './pages/PendingReceipts.jsx'
import { useSchool } from './context/SchoolContext.jsx'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { syncNow } = useSchool()

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (isOnline) {
      syncNow()
    }
  }, [isOnline, syncNow])

  useEffect(() => {
    if (!isOnline) return
    const interval = setInterval(() => {
      syncNow()
    }, 60000)
    return () => clearInterval(interval)
  }, [isOnline, syncNow])

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#f6f3ee] text-[#1f1b17]">
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-[#f3d9b1] opacity-40 blur-[120px]"></div>
          <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-[#cfe5d2] opacity-45 blur-[120px]"></div>
        </div>
        <div className="relative mx-auto flex min-h-screen max-w-[1240px] flex-col gap-6 px-4 py-5 md:flex-row md:px-6 md:py-6">
          {sidebarOpen ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-[#1f1b17]/40 backdrop-blur md:hidden"
              aria-label="Close sidebar"
            />
          ) : null}
          <div
            className={`fixed inset-y-0 left-0 z-50 w-[280px] transform transition md:static md:translate-x-0 md:w-[260px] ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <Sidebar onClose={() => setSidebarOpen(false)} showClose />
          </div>
          <main className="flex-1 rounded-[28px] border border-[#e5ddd2] bg-[#fbf9f5]/80 p-4 shadow-[0_18px_45px_-30px_rgba(31,27,23,0.6)] backdrop-blur md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="rounded-full border border-[#1f1b17] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#1f1b17] md:hidden"
              >
                Menu
              </button>
            </div>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/receipts" element={<PendingReceipts />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
