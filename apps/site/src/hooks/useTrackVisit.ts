'use client'

import { useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

export function useTrackVisit(origin: 'kings' | 'msu') {
  useEffect(() => {
    const track = async () => {
      const storageKey = `kings_session_${origin}`
      let sessionId = sessionStorage.getItem(storageKey)
      
      if (!sessionId) {
        sessionId = crypto.randomUUID()
        sessionStorage.setItem(storageKey, sessionId)
        
        // Log to database
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        
        await supabase.from('site_visits').insert({
          session_id: sessionId,
          origin
        })
      }
    }
    
    track().catch(console.error)
  }, [origin])
}
