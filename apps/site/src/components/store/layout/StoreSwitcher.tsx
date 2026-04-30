import Link from 'next/link'

interface StoreSwitcherProps {
  store: 'kings' | 'seven' | 'msu';
}

export function StoreSwitcher({ store }: StoreSwitcherProps) {
  let label = '';
  let href = '';
  const themeClass = `theme-${store}`;

  if (store === 'kings') {
    label = 'KINGS SIMULADORES';
    href = '/';
  } else if (store === 'seven') {
    label = 'SEVEN SIM RACING';
    href = '/seven';
  } else if (store === 'msu') {
    label = 'MEU SIMULADOR USADO';
    href = '/usado';
  }

  return (
    <Link 
      href={href} 
      className={`${themeClass} hover:scale-105`}
      style={{
        fontSize: 'clamp(10px, 2.5vw, 12px)',
        color: '#fff',
        fontWeight: 800,
        padding: '8px 12px', // increased horizontal padding slightly for better look
        width: 'auto', // changed from 100% to auto to prevent stretching
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        whiteSpace: 'nowrap', // Added this to prevent wrapping
        background: 'var(--gradient-primary)',
        boxShadow: '0 4px 10px var(--accent-glow)',
        borderRadius: '6px',
        textDecoration: 'none',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: 'none',
      }}
    >
      {label}
    </Link>
  )
}
