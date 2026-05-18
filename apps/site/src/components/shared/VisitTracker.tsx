'use client'

import { useTrackVisit } from '@/hooks/useTrackVisit'

export function VisitTracker({ origin }: { origin: 'kings' | 'msu' }) {
  useTrackVisit(origin)
  return null
}
