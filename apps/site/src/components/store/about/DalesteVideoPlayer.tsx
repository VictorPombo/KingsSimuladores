'use client'

import React, { useRef, useState } from 'react'

export function DalesteVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [speed, setSpeed] = useState<number>(1)

  const handleSpeedChange = (newSpeed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed
      setSpeed(newSpeed)
    }
  }

  const speeds = [1, 1.25, 1.5, 2]

  return (
    <div style={{ marginBottom: '40px', width: '100%' }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        border: '1px solid rgba(0, 229, 255, 0.2)', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)', 
        background: '#04060b' 
      }}>
        <video 
          ref={videoRef}
          src="/videos/historia-daleste.mp4" 
          controls 
          playsInline
          autoPlay
          onLoadedMetadata={(e) => {
            const vid = e.target as HTMLVideoElement;
            vid.volume = 1.0; // Volume no máximo
          }}
          style={{ width: '100%', height: 'auto', display: 'block', aspectRatio: '16/9', objectFit: 'cover' }}
        >
          Seu navegador não suporta a visualização desse vídeo.
        </video>
      </div>

      {/* Controles de Velocidade (Abaixo do Vídeo) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginRight: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Velocidade:
        </span>
        {speeds.map(v => (
          <button
            key={v}
            onClick={() => handleSpeedChange(v)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: speed === v ? '1px solid var(--success)' : '1px solid rgba(255,255,255,0.1)',
              background: speed === v ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-card)',
              color: speed === v ? 'var(--success)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 700,
              transition: 'all 0.2s',
              boxShadow: speed === v ? '0 0 10px rgba(16, 185, 129, 0.2)' : 'none'
            }}
            className="hover:border-emerald-500 hover:text-emerald-500"
          >
            {v}x
          </button>
        ))}
      </div>
    </div>
  )
}
