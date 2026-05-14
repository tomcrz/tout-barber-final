'use client'
import { useState } from 'react'
import ClientPage from '@/components/ClientPage'
import Dashboard from '@/components/Dashboard'
import LockScreen from '@/components/LockScreen'

export default function Home() {
  const [page, setPage] = useState<'client' | 'lock' | 'dashboard'>('client')

  function tryDash() {
    if (page === 'dashboard') return
    setPage('lock')
  }

  function onUnlock() {
    setPage('dashboard')
  }

  function onLogout() {
    setPage('client')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-6 py-4">
        <div className="font-playfair text-2xl font-bold tracking-widest text-[#0C447C]">
          TC<span className="text-[#C9A84C]">UT</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage('client')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              page === 'client'
                ? 'bg-[#0C447C] text-white border-[#0C447C]'
                : 'bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            ✂️ Réserver
          </button>
          <button
            onClick={tryDash}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              page === 'dashboard'
                ? 'bg-[#0C447C] text-white border-[#0C447C]'
                : 'bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50'
            }`}
          >
            📊 Dashboard
          </button>
        </div>
      </nav>

      {page === 'client' && <ClientPage />}
      {page === 'lock' && <LockScreen onUnlock={onUnlock} />}
      {page === 'dashboard' && <Dashboard onLogout={onLogout} />}
    </div>
  )
}
