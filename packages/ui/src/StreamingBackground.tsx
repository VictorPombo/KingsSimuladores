'use client'

import { useEffect, useRef } from 'react'

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Configuração Kings Simuladores
// Quantidade: 101 | Velocidade: 5 | Comprimento: 39 | Mouse: 85
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CONFIG = {
  count:  101,
  speed:  5,
  length: 39,
  force:  85,
  colors: ['#00e5ff', '#8b5cf6', '#06d6a0', '#a78bfa', '#c8eeff'],
  background: '#06080f',
}

interface Streak {
  x: number
  y: number
  vx: number
  vy: number
  tilt: number
  width: number
  life: number
  maxLife: number
  color: string
  alpha: number
}

export function StreamingBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouse     = useRef({ x: -9999, y: -9999 })
  const streaks   = useRef<Streak[]>([])
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const DPR = window.devicePixelRatio || 1

    // ── resize ──────────────────────────────
    function resize() {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      canvas!.width  = W * DPR
      canvas!.height = H * DPR
      ctx!.setTransform(DPR, 0, 0, DPR, 0, 0)
    }

    // ── fábrica de traço ────────────────────
    function makeStreak(): Streak {
      const W = canvas!.offsetWidth
      const H = canvas!.offsetHeight
      const color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)]
      const tilt  = (Math.random() - 0.5) * 0.22
      return {
        x:       Math.random() * W,
        y:       H + Math.random() * H * 0.5,
        vx:      tilt,
        vy:      -(Math.random() * 0.8 + 0.5),
        tilt,
        width:   Math.random() * 1.1 + 0.3,
        life:    0,
        maxLife: Math.random() * 200 + 100,
        color,
        alpha:   0,
      }
    }

    // ── inicializar traços ──────────────────
    function init() {
      const H = canvas!.offsetHeight
      streaks.current = []
      for (let i = 0; i < CONFIG.count; i++) {
        const s = makeStreak()
        s.y    = Math.random() * H          // distribuir pela tela no início
        s.life = Math.random() * s.maxLife
        streaks.current.push(s)
      }
    }

    // ── loop de animação ────────────────────
    function draw() {
      const W   = canvas!.offsetWidth
      const H   = canvas!.offsetHeight
      const spd = CONFIG.speed / 4
      const frc = CONFIG.force / 10
      const LEN = CONFIG.length

      ctx!.clearRect(0, 0, W, H)
      ctx!.fillStyle = CONFIG.background
      ctx!.fillRect(0, 0, W, H)

      for (const s of streaks.current) {
        s.life++

        // fade in / fade out
        const prog = s.life / s.maxLife
        if (prog < 0.12)      s.alpha = prog / 0.12
        else if (prog > 0.7)  s.alpha = 1 - (prog - 0.7) / 0.3
        else                  s.alpha = 1
        s.alpha = Math.max(0, Math.min(1, s.alpha))

        // movimento
        s.x += s.vx * spd
        s.y += s.vy * spd

        // repulsão do mouse
        const dx   = s.x - mouse.current.x
        const dy   = s.y - mouse.current.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 110 && dist > 0) {
          const str = (1 - dist / 110) * frc * 0.15
          s.x += (dx / dist) * str
          s.y += (dy / dist) * str * 0.5
        }

        // renascer ao sair da tela
        if (s.life >= s.maxLife || s.y < -LEN * 2) {
          Object.assign(s, makeStreak())
          continue
        }

        // ── desenhar ───────────────────────
        const len = LEN * (0.6 + s.alpha * 0.4)
        const tx  = s.x + s.tilt * len   // base (transparente)
        const ty  = s.y
        const bx  = s.x - s.tilt * len   // ponta (branco)
        const by  = s.y - len

        ctx!.save()
        ctx!.globalAlpha              = s.alpha
        ctx!.globalCompositeOperation = 'screen'
        ctx!.lineCap                  = 'round'

        // brilho difuso simulado SEM 'filter: blur()' para 60fps cravado!
        const glowG = ctx!.createLinearGradient(tx, ty, bx, by)
        glowG.addColorStop(0,   s.color + '00')
        glowG.addColorStop(0.5, s.color + '33')
        glowG.addColorStop(1,   s.color + '00')
        ctx!.strokeStyle = glowG
        ctx!.lineWidth   = s.width * 6
        ctx!.beginPath()
        ctx!.moveTo(tx, ty)
        ctx!.lineTo(bx, by)
        ctx!.stroke()

        // traço principal
        const mainG = ctx!.createLinearGradient(tx, ty, bx, by)
        mainG.addColorStop(0,   s.color + '00')
        mainG.addColorStop(0.4, s.color + '88')
        mainG.addColorStop(0.8, s.color + 'ff')
        mainG.addColorStop(1,   '#ffffff')
        ctx!.strokeStyle = mainG
        ctx!.lineWidth   = s.width
        ctx!.beginPath()
        ctx!.moveTo(tx, ty)
        ctx!.lineTo(bx, by)
        ctx!.stroke()

        ctx!.restore()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    // ── eventos ─────────────────────────────
    function onMouseMove(e: MouseEvent) {
      const rect      = canvas!.getBoundingClientRect()
      mouse.current.x = e.clientX - rect.left
      mouse.current.y = e.clientY - rect.top
    }
    function onMouseLeave() {
      mouse.current = { x: -9999, y: -9999 }
    }
    function onResize() {
      resize()
      init()
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)
    window.addEventListener('resize', onResize)

    resize()
    init()
    draw()

    return () => {
      cancelAnimationFrame(rafRef.current)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top:      0,
        left:     0,
        width:    '100%',
        height:   '100%',
        display:  'block',
        zIndex:   0,
      }}
    />
  )
}
