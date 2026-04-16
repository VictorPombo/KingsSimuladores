'use client'

import React, { useEffect, useRef } from 'react'

export function LevelVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      // Inicia o vídeo manualmente para evitar o bug de Strict Mode / Fast Refresh do React 18
      video.play().catch(err => console.log("Autoplay bloqueado pelo navegador:", err))
    }
    
    return () => {
      // Pausa imediatamente ao desmontar (Hot Reload) para matar o áudio fantasma
      if (video) {
        video.pause()
      }
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      loop
      controls
      playsInline
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  )
}
