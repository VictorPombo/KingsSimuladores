'use client'

/**
 * StreamingBackground — Retro-wave 3D Grid
 * 
 * Efeito visual de grade perspectiva infinita (estilo Outrun/Synthwave).
 * ✅ CSS Puro — sem Canvas, WebGL, ou libs externas.
 * ✅ 60fps — anima apenas background-position (GPU-accelerated).
 * ✅ position: fixed, z-index: -1 — não interfere na UI.
 */

import { usePathname } from 'next/navigation'

export function StreamingBackground() {
  const pathname = usePathname()
  const isMsu = pathname?.startsWith('/usado')

  return (
    <>
      <div
        aria-hidden="true"
        className="streaming-bg-root"
        data-theme={isMsu ? 'msu' : 'kings'}
      >
        {/* ─── Ambient Glow: horizonte ─── */}
        <div className="streaming-bg-glow-horizon" />

        {/* ─── Ambient Glow: topo (roxo sutil) ─── */}
        <div className="streaming-bg-glow-top" />

        {/* ─── Linha do Horizonte ─── */}
        <div className="streaming-bg-horizon-line" />

        {/* ─── Grid do Chão (Perspectiva 3D) ─── */}
        <div className="streaming-bg-floor" />

        {/* ─── Grid do Teto (Perspectiva 3D invertida) ─── */}
        <div className="streaming-bg-ceiling" />

        {/* ─── Vignette nas bordas ─── */}
        <div className="streaming-bg-vignette" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: STREAMING_CSS }} />
    </>
  )
}

const STREAMING_CSS = `
  /* ─── Variables for Themes ─── */
  .streaming-bg-root {
    --sb-accent: 0, 232, 150;      /* Green Kings */
    --sb-secondary: 0, 180, 245;  /* Blue Kings */
  }

  .streaming-bg-root[data-theme="msu"] {
    --sb-accent: 139, 92, 246;     /* Purple */
    --sb-secondary: 217, 70, 239;  /* Pink */
  }

  /* ─── Container ─── */
  .streaming-bg-root {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    background: #06080f;
    pointer-events: none;
  }

  /* ─── Glow no horizonte (cyan forte) ─── */
  .streaming-bg-glow-horizon {
    position: absolute;
    top: 15%;
    left: 50%;
    transform: translateX(-50%);
    width: 200%;
    height: 30%;
    background: radial-gradient(
      ellipse 50% 50% at 50% 50%,
      rgba(var(--sb-accent), 0.15) 0%,
      rgba(var(--sb-secondary), 0.08) 50%,
      transparent 80%
    );
  }

  /* ─── Glow topo (roxo) ─── */
  .streaming-bg-glow-top {
    position: absolute;
    top: -10%;
    left: 50%;
    transform: translateX(-50%);
    width: 140%;
    height: 45%;
    background: radial-gradient(
      ellipse 50% 50% at 50% 100%,
      rgba(var(--sb-secondary), 0.06) 0%,
      rgba(var(--sb-accent), 0.03) 40%,
      transparent 70%
    );
  }

  /* ─── Linha do Horizonte ─── */
  .streaming-bg-horizon-line {
    position: absolute;
    top: 30%;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(var(--sb-accent), 0.4) 20%,
      rgba(var(--sb-accent), 0.8) 50%,
      rgba(var(--sb-accent), 0.4) 80%,
      transparent 100%
    );
    /* Removido box-shadow super pesado */
  }

  /* ─── Grid do Chão ─── */
  .streaming-bg-floor {
    position: absolute;
    left: -50%;
    right: -50%;
    top: 30%;
    height: 150vh;
    transform-origin: center top;
    background-image:
      linear-gradient(
        to right,
        rgba(var(--sb-accent), 0.18) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(var(--sb-accent), 0.18) 1px,
        transparent 1px
      );
    background-size: 60px 60px;
    animation: streamGridDown 2s linear infinite;
    will-change: background-position;
    /* Mask-image removido por causar extremas quedas de GPU e CPU */
    transform: perspective(350px) rotateX(60deg) translateZ(0); /* Força GPU real */
  }

  /* ─── Grid do Teto ─── */
  .streaming-bg-ceiling {
    position: absolute;
    left: -50%;
    right: -50%;
    bottom: 70%;
    height: 100vh;
    transform-origin: center bottom;
    background-image:
      linear-gradient(
        to right,
        rgba(var(--sb-secondary), 0.10) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(var(--sb-secondary), 0.10) 1px,
        transparent 1px
      );
    background-size: 60px 60px;
    animation: streamGridUp 3s linear infinite;
    will-change: background-position;
    /* Mask-image removido por causar lentidão extrema */
    transform: perspective(350px) rotateX(-60deg) translateZ(0); /* Força GPU real */
  }

  /* ─── Vignette ─── */
  .streaming-bg-vignette {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      ellipse 80% 80% at 50% 50%,
      transparent 30%,
      rgba(6, 8, 15, 0.4) 70%,
      rgba(6, 8, 15, 0.8) 100%
    );
  }

  /* ─── Keyframes (GPU: background-position only) ─── */
  @keyframes streamGridDown {
    0%   { background-position: calc(50% + 30px) 0; }
    100% { background-position: calc(50% + 30px) 60px; }
  }

  @keyframes streamGridUp {
    0%   { background-position: calc(50% + 30px) 0; }
    100% { background-position: calc(50% + 30px) -60px; }
  }
`
