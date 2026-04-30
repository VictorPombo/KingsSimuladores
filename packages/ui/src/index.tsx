/**
 * @kings/ui — Component Library
 *
 * Componentes base do Design System Kings Hub.
 * Todos os componentes usam CSS Variables definidos em globals.css.
 */
import React from 'react'

export * from './ProductCard'
export * from './StreamingBackground'
export * from './Toast'

/* ═══════════ Button ═══════════ */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-display)',
    fontWeight: 700,
    letterSpacing: '0.5px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid transparent',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.6 : 1,
    transition: 'all var(--transition-fast)',
    textTransform: 'uppercase' as const,
    ...style,
  }

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: '0.75rem' },
    md: { padding: '10px 24px', fontSize: '0.85rem' },
    lg: { padding: '14px 32px', fontSize: '1rem' },
  }

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      background: 'var(--gradient-primary)',
      color: 'var(--text-inverse)',
    },
    secondary: {
      background: 'transparent',
      border: '1px solid var(--accent)',
      color: 'var(--accent)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
    },
    danger: {
      background: 'var(--danger)',
      color: '#fff',
    },
  }

  return (
    <button
      style={{ ...baseStyles, ...sizeStyles[size], ...variantStyles[variant] }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="animate-pulse">⏳</span>}
      {children}
    </button>
  )
}

/* ═══════════ Card ═══════════ */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  glow?: boolean
}

export function Card({ hover = true, glow = false, children, style, ...props }: CardProps) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        transition: 'all var(--transition-normal)',
        ...(glow ? { boxShadow: 'var(--shadow-glow)' } : {}),
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/* ═══════════ Input ═══════════ */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, style, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.78rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          background: 'var(--bg-secondary)',
          border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
          borderRadius: 'var(--radius-sm)',
          padding: '10px 14px',
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color var(--transition-fast)',
          width: '100%',
          ...style,
        }}
        {...props}
      />
      {error && (
        <span style={{ fontSize: '0.72rem', color: 'var(--danger)' }}>{error}</span>
      )}
    </div>
  )
}

/* ═══════════ Badge ═══════════ */
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'danger'
}

export function Badge({ children, variant = 'info', style, className, ...props }: BadgeProps) {
  const colors: Record<string, { bg: string; fg: string }> = {
    info: { bg: 'var(--accent-dim)', fg: 'var(--accent)' },
    success: { bg: 'rgba(6,214,160,.12)', fg: 'var(--success)' },
    warning: { bg: 'rgba(255,209,102,.12)', fg: 'var(--warning)' },
    danger: { bg: 'rgba(255,59,92,.12)', fg: 'var(--danger)' },
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.68rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: colors[variant].bg,
        color: colors[variant].fg,
      }}
      {...props}
    >
      {children}
    </span>
  )
}

/* ═══════════ Spinner ═══════════ */
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '2px solid var(--border)',
        borderTopColor: 'var(--accent)',
        borderRadius: '50%',
        animation: 'spin 0.6s linear infinite',
      }}
    />
  )
}

/* ═══════════ Container ═══════════ */
export function Container({
  children,
  maxWidth = '1920px',
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { maxWidth?: string }) {
  return (
    <div
      style={{
        maxWidth,
        margin: '0 auto',
        padding: '0 clamp(16px, 2vw, 40px)',
        width: '100%',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
