'use client'
import { useState } from 'react'

const CODE = '1234'

export default function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)

  function check() {
    if (value === CODE) {
      setError(false)
      onUnlock()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[500px] px-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm text-center shadow-sm">
        <div className="w-14 h-14 bg-[#E6F1FB] rounded-full flex items-center justify-center mx-auto mb-4 text-[#0C447C] text-2xl">
          🔒
        </div>
        <h2 className="font-playfair text-xl font-bold mb-2">Accès Dashboard</h2>
        <p className="text-sm text-gray-400 mb-6">Entrez votre code pour continuer</p>
        <input
          type="password"
          maxLength={4}
          value={value}
          onChange={e => { setValue(e.target.value); setError(false) }}
          onKeyDown={e => e.key === 'Enter' && check()}
          autoFocus
          placeholder="••••"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg text-xl text-center tracking-[12px] bg-gray-50 focus:outline-none focus:border-[#378ADD] mb-3"
        />
        {error && <p className="text-red-600 text-sm mb-3">Code incorrect. Réessayez.</p>}
        <button
          onClick={check}
          className="w-full py-3 bg-[#0C447C] text-white rounded-lg text-sm font-medium hover:bg-[#185FA5] transition-all"
        >
          Accéder
        </button>
      </div>
    </div>
  )
}
