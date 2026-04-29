'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search } from 'lucide-react'

export function SearchBar({ variant = 'kings' }: { variant?: 'kings' | 'seven' | 'msu' }) {
  const [query, setQuery] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      let basePath = '/produtos'
      if (pathname.startsWith('/seven')) basePath = '/seven/produtos'
      else if (pathname.startsWith('/usado')) basePath = '/usado/anuncios'
      
      router.push(`${basePath}?q=${encodeURIComponent(query.trim())}`)
    }
  }

  if (variant === 'seven' || variant === 'msu') {
    const isMSU = variant === 'msu'
    return (
      <form onSubmit={handleSearch} style={{ position: 'relative', width: '100%' }}>
        <input 
          type="text" 
          placeholder={isMSU ? "Buscar volantes, pedais, cockpits..." : "BUSCAR NA LOJA"} 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: '100%', padding: isMSU ? '12px 20px' : '14px 20px', paddingRight: '50px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.1)', background: isMSU ? 'rgba(255,255,255,0.02)' : 'transparent', color: '#fff', fontSize: isMSU ? '0.9rem' : '0.85rem', outline: 'none', transition: 'all 0.3s' }}
          className={isMSU ? "focus:border-[#d946ef] focus:bg-[rgba(255,255,255,0.05)]" : "focus:border-[#ea580c] focus:bg-[rgba(255,255,255,0.02)]"}
        />
        <button type="submit" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Search size={20} color={isMSU ? "#94a3b8" : "#f8fafc"} />
        </button>
      </form>
    )
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
