'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/produtos?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <form 
      onSubmit={handleSearch}
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#fff',
        borderRadius: '8px',
        padding: '0 16px',
        width: '100%',
        maxWidth: '500px',
        height: '48px',
        margin: '0 auto',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}
    >
      <input
        type="text"
        placeholder="Tá procurando alguma coisa?"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          border: 'none',
          background: 'transparent',
          outline: 'none',
          width: '100%',
          fontSize: '0.95rem',
          color: '#333',
        }}
      />
      <button 
        type="submit"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#111',
          padding: '0',
          marginLeft: '8px'
        }}
      >
        <Search size={22} strokeWidth={2.5} />
      </button>
    </form>
  )
}
