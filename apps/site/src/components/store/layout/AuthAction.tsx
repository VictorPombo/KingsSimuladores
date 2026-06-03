import { createServerSupabaseClient } from '@kings/db/server'
import Link from 'next/link'

interface AuthActionProps {
  store: 'kings' | 'seven' | 'msu';
  mobile?: boolean;
}

export async function AuthAction({ store, mobile }: AuthActionProps) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const isLoggedIn = !!user;
  const label = isLoggedIn ? 'Painel' : 'Login';
  
  let href = '';
  if (store === 'kings') {
    href = isLoggedIn ? '/account' : '/login';
  } else if (store === 'seven') {
    href = isLoggedIn ? '/seven/account' : '/seven/login';
  } else if (store === 'msu') {
    href = isLoggedIn ? '/usado/account' : '/usado/login';
  }

  const padding = mobile ? '4px 12px' : '6px 20px';
  const fontSize = mobile ? '0.75rem' : '0.85rem';

  return (
    <>
      <Link 
        href={href} 
        className="auth-action-btn"
        style={{ 
          textDecoration: 'none', 
          padding, 
          border: `1px solid var(--accent)`, 
          color: 'var(--accent)', 
          borderRadius: '6px', 
          fontWeight: 700, 
          fontSize, 
          transition: 'all 0.2s', 
          textTransform: 'uppercase', 
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1
        }} 
      >
        {label}
      </Link>
    </>
  )
}
