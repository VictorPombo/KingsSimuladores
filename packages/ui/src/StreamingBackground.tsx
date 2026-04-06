'use client'

/**
 * StreamingBackground — Retro-wave 3D Grid
 * 
 * Efeito visual de grade perspectiva infinita (estilo Outrun/Synthwave).
 * ✅ CSS Puro — sem Canvas, WebGL, ou libs externas.
 * ✅ 60fps — anima apenas background-position (GPU-accelerated).
 * ✅ position: fixed, z-index: -1 — não interfere na UI.
 */

export function StreamingBackground() {
  return (
    <>
      <div
        aria-hidden="true"
        className="streaming-bg-root"
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
    bottom: 25%;
    left: 50%;
    transform: translateX(-50%);
    width: 160%;
    height: 50%;
    background: radial-gradient(
      ellipse 45% 40% at 50% 0%,
      rgba(0, 229, 255, 0.12) 0%,
      rgba(139, 92, 246, 0.05) 40%,
      transparent 70%
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
      rgba(139, 92, 246, 0.06) 0%,
      rgba(0, 229, 255, 0.03) 40%,
      transparent 70%
    );
  }

  /* ─── Linha do Horizonte ─── */
  .streaming-bg-horizon-line {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(
      90deg,
      transparent 2%,
      rgba(0, 229, 255, 0.2) 20%,
      rgba(0, 229, 255, 0.4) 50%,
      rgba(0, 229, 255, 0.2) 80%,
      transparent 98%
    );
    box-shadow: 0 0 15px rgba(0, 229, 255, 0.15), 0 0 40px rgba(0, 229, 255, 0.05);
  }

  /* ─── Grid do Chão ─── */
  .streaming-bg-floor {
    position: absolute;
    left: -50%;
    right: -50%;
    top: 50%;
    height: 100vh;
    transform-origin: center top;
    transform: perspective(350px) rotateX(60deg);
    background-image:
      linear-gradient(
        to right,
        rgba(0, 229, 255, 0.18) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(0, 229, 255, 0.18) 1px,
        transparent 1px
      );
    background-size: 60px 60px;
    animation: streamGridDown 2.5s linear infinite;
    will-change: background-position;
    -webkit-mask-image: 
      linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-image: 
      linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 75%, transparent 100%),
      linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, transparent 100%);
    mask-composite: intersect;
  }

  /* ─── Grid do Teto ─── */
  .streaming-bg-ceiling {
    position: absolute;
    left: -50%;
    right: -50%;
    bottom: 50%;
    height: 80vh;
    transform-origin: center bottom;
    transform: perspective(350px) rotateX(-60deg);
    background-image:
      linear-gradient(
        to right,
        rgba(139, 92, 246, 0.10) 1px,
        transparent 1px
      ),
      linear-gradient(
        to bottom,
        rgba(139, 92, 246, 0.10) 1px,
        transparent 1px
      );
    background-size: 60px 60px;
    animation: streamGridUp 3.5s linear infinite;
    will-change: background-position;
    -webkit-mask-image: 
      linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 80%),
      linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%);
    -webkit-mask-composite: source-in;
    mask-image: 
      linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 40%, transparent 80%),
      linear-gradient(to right, transparent 0%, rgba(0,0,0,1) 20%, rgba(0,0,0,1) 80%, transparent 100%);
    mask-composite: intersect;
  }

  /* ─── Vignette ─── */
  .streaming-bg-vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      ellipse 65% 55% at 50% 50%,
      transparent 20%,
      rgba(6, 8, 15, 0.7) 80%,
      #06080f 100%
    );
  }

  /* ─── Keyframes (GPU: background-position only) ─── */
  @keyframes streamGridDown {
    0%   { background-position: 0 0; }
    100% { background-position: 0 60px; }
  }

  @keyframes streamGridUp {
    0%   { background-position: 0 0; }
    100% { background-position: 0 -60px; }
  }
`
