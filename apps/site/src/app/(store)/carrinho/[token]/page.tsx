'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/CartContext'
import { Loader2, ShoppingCart, AlertTriangle, Clock } from 'lucide-react'

export default function CartLinkPage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const { addItem, applyCoupon, isLoaded } = useCart()
  const [status, setStatus] = useState<'loading' | 'injecting' | 'error' | 'expired'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!isLoaded) return

    async function loadCartLink() {
      try {
        const res = await fetch(`/api/cart-link/${params.token}`)

        if (res.status === 410) {
          setStatus('expired')
          return
        }

        if (!res.ok) {
          setStatus('error')
          setErrorMsg('Link inválido ou não encontrado.')
          return
        }

        const data = await res.json()
        setStatus('injecting')

        // Injetar cada item no carrinho
        for (const item of data.items) {
          addItem({
            id: item.id,
            title: item.title,
            price: item.price,
            imageUrl: item.imageUrl || '',
            brand: item.brand || 'kings',
            storeOrigin: item.storeOrigin || 'kings',
            quantity: item.quantity,
          })
        }

        // Aplicar cupom se existir
        if (data.coupon_code) {
          try {
            const couponRes = await fetch(`/api/coupon/validate?code=${data.coupon_code}`)
            if (couponRes.ok) {
              const couponData = await couponRes.json()
              if (couponData.valid) {
                applyCoupon({
                  id: couponData.id,
                  code: data.coupon_code,
                  type: couponData.type,
                  value: couponData.value,
                })
              }
            }
          } catch {
            // Cupom inválido — não bloquear o fluxo
          }
        }

        // Redirecionar para a loja (o carrinho drawer abre automaticamente via addItem)
        setTimeout(() => router.push('/'), 500)
      } catch {
        setStatus('error')
        setErrorMsg('Erro ao carregar o carrinho.')
      }
    }

    loadCartLink()
  }, [isLoaded]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0f',
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        padding: '48px 32px',
        background: '#111118',
        borderRadius: '16px',
        border: '1px solid #2a2a35',
      }}>
        {(status === 'loading' || status === 'injecting') && (
          <>
            <Loader2
              size={48}
              color="#00e5ff"
              style={{ margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}
            />
            <h1 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px' }}>
              {status === 'loading' ? 'Carregando carrinho...' : 'Montando seu carrinho...'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              Aguarde enquanto preparamos tudo pra você
            </p>
          </>
        )}

        {status === 'expired' && (
          <>
            <Clock size={48} color="#f59e0b" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px' }}>
              Link expirado
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 24px' }}>
              Este link de carrinho já expirou. Entre em contato com a Kings para um novo link.
            </p>
            <a
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #00e5ff, #10b981)',
                color: '#000', fontWeight: 700, padding: '12px 28px',
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem',
              }}
            >
              <ShoppingCart size={18} /> Ir para a loja
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertTriangle size={48} color="#ef4444" style={{ margin: '0 auto 24px' }} />
            <h1 style={{ color: '#fff', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 8px' }}>
              Oops!
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 24px' }}>
              {errorMsg}
            </p>
            <a
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #00e5ff, #10b981)',
                color: '#000', fontWeight: 700, padding: '12px 28px',
                borderRadius: '8px', textDecoration: 'none', fontSize: '0.9rem',
              }}
            >
              <ShoppingCart size={18} /> Ir para a loja
            </a>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
