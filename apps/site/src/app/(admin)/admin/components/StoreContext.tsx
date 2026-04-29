'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export type StoreType = 'kings' | 'msu' | 'seven' | 'all'

interface StoreContextType {
  currentStore: StoreType
  setCurrentStore: (store: StoreType) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [currentStore, setCurrentStore] = useState<StoreType>('all')
  const router = useRouter()

  useEffect(() => {
    // Read from cookie on mount
    const match = document.cookie.match(new RegExp('(^| )admin_store=([^;]+)'))
    if (match && ['kings', 'msu', 'seven', 'all'].includes(match[2])) {
      setCurrentStore(match[2] as StoreType)
    }
  }, [])

  const setAndSaveStore = (store: StoreType) => {
    setCurrentStore(store)
    document.cookie = `admin_store=${store}; path=/admin; max-age=31536000`
    router.refresh() // Trigger Server Components to re-render with new cookie
  }

  return (
    <StoreContext.Provider value={{ currentStore, setCurrentStore: setAndSaveStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStoreContext() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider')
  }
  return context
}
