export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#06080f',
        overflow: 'hidden',
      }}
    >
      {/* ─── Animated Multi-Color Grid Background ─── */}

      {/* Ambient glow: green center */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '200%',
        height: '30%',
        background: 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(16,185,129,0.15) 0%, rgba(139,92,246,0.08) 50%, transparent 80%)',
        pointerEvents: 'none',
      }} />

      {/* Ambient glow: purple top */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '140%',
        height: '45%',
        background: 'radial-gradient(ellipse 50% 50% at 50% 100%, rgba(139,92,246,0.08) 0%, rgba(249,115,22,0.04) 40%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Horizon line - multi-color gradient */}
      <div style={{
        position: 'absolute',
        top: '30%',
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(139,92,246,0.6) 20%, rgba(16,185,129,0.8) 50%, rgba(249,115,22,0.6) 80%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Floor grid - green + purple */}
      <div className="splash-floor" />

      {/* Ceiling grid - orange + purple */}
      <div className="splash-ceiling" />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 80% at 50% 50%, transparent 30%, rgba(6,8,15,0.5) 70%, rgba(6,8,15,0.9) 100%)',
      }} />

      {/* ─── Logo + Text ─── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
      }}>
        <img
          src="/logoKingsHub.jpg"
          alt="KingsHub"
          className="splash-logo"
          style={{
            width: 'clamp(160px, 40vw, 280px)',
            height: 'auto',
            borderRadius: '20px',
            objectFit: 'contain',
          }}
        />

        {/* Loading bar */}
        <div style={{
          width: 'clamp(120px, 30vw, 200px)',
          height: '3px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div className="splash-loading-bar" />
        </div>

        <span style={{
          fontSize: '0.75rem',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
          fontWeight: 600,
        }}>
          CARREGANDO...
        </span>
      </div>

      {/* ─── CSS Animations ─── */}
      <style dangerouslySetInnerHTML={{ __html: `
        /* Floor grid - uses green+purple gradient lines */
        .splash-floor {
          position: absolute;
          left: -50%;
          right: -50%;
          top: 30%;
          height: 150vh;
          transform-origin: center top;
          background-image:
            linear-gradient(
              to right,
              rgba(16, 185, 129, 0.18) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.18) 1px,
              transparent 1px
            );
          background-size: 60px 60px;
          animation: splashGridDown 2s linear infinite;
          will-change: background-position;
          transform: perspective(350px) rotateX(60deg) translateZ(0);
          pointer-events: none;
        }

        /* Ceiling grid - uses orange+purple gradient lines */
        .splash-ceiling {
          position: absolute;
          left: -50%;
          right: -50%;
          bottom: 70%;
          height: 100vh;
          transform-origin: center bottom;
          background-image:
            linear-gradient(
              to right,
              rgba(249, 115, 22, 0.12) 1px,
              transparent 1px
            ),
            linear-gradient(
              to bottom,
              rgba(139, 92, 246, 0.12) 1px,
              transparent 1px
            );
          background-size: 60px 60px;
          animation: splashGridUp 3s linear infinite;
          will-change: background-position;
          transform: perspective(350px) rotateX(-60deg) translateZ(0);
          pointer-events: none;
        }

        /* Logo entrance animation */
        .splash-logo {
          animation: splashLogoIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards,
                     splashLogoPulse 2.5s ease-in-out 1s infinite;
          opacity: 0;
          transform: scale(0.8);
        }

        @keyframes splashLogoIn {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes splashLogoPulse {
          0%, 100% { filter: drop-shadow(0 0 20px rgba(139,92,246,0.3)) drop-shadow(0 0 40px rgba(16,185,129,0.15)); }
          50% { filter: drop-shadow(0 0 30px rgba(249,115,22,0.4)) drop-shadow(0 0 60px rgba(139,92,246,0.2)); }
        }

        /* Loading bar animation */
        .splash-loading-bar {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 40%;
          border-radius: 4px;
          background: linear-gradient(90deg, rgba(139,92,246,0.8), rgba(16,185,129,0.8), rgba(249,115,22,0.8));
          animation: splashBarSlide 1.5s ease-in-out infinite;
        }

        @keyframes splashBarSlide {
          0% { left: -40%; }
          100% { left: 100%; }
        }

        @keyframes splashGridDown {
          0%   { background-position: calc(50% + 30px) 0; }
          100% { background-position: calc(50% + 30px) 60px; }
        }

        @keyframes splashGridUp {
          0%   { background-position: calc(50% + 30px) 0; }
          100% { background-position: calc(50% + 30px) -60px; }
        }
      ` }} />
    </div>
  )
}
