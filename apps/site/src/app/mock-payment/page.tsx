'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@kings/ui'

export default function MockPaymentPage() {
  const searchParams = useSearchParams()
  const store = searchParams.get('store') || 'Kings Simuladores'
  const amount = searchParams.get('amount') || '0.00'
  
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    // Simulando tempo de carregamento do Mercado Pago
    const t = setTimeout(() => {
      // ready
    }, 1000)
    return () => clearTimeout(t)
  }, [])

  const handlePay = () => {
    setStatus('processing')
    setTimeout(() => {
      setStatus('approved')
    }, 1500)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        
        <img 
          src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.19.1/mercadopago/logo__large.png" 
          alt="Mercado Pago" 
          style={{ height: '40px', marginBottom: '24px' }} 
        />

        {status === 'pending' && (
          <>
            <h2 style={{ color: '#333', fontSize: '1.5rem', marginBottom: '8px' }}>Finalizar Pagamento</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Você está no ambiente de simulação.<br/>
              Pagamento para a loja: <strong>{store.toUpperCase()}</strong>
            </p>

            <div style={{ background: '#f9f9f9', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #eee' }}>
              <span style={{ display: 'block', color: '#666', fontSize: '0.9rem', marginBottom: '4px' }}>Valor a pagar:</span>
              <strong style={{ fontSize: '2rem', color: '#333' }}>R$ {amount}</strong>
            </div>

            <Button onClick={handlePay} style={{ width: '100%', background: '#009ee3', color: '#fff', fontSize: '1.1rem', padding: '14px' }}>
              Simular Pagamento (Teste)
            </Button>
          </>
        )}

        {status === 'processing' && (
          <div style={{ padding: '40px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #009ee3', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ color: '#666' }}>Processando no banco emissor...</p>
          </div>
        )}

        {status === 'approved' && (
          <div style={{ padding: '20px 0' }}>
            <div style={{ width: '60px', height: '60px', background: '#00a650', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <h2 style={{ color: '#00a650', fontSize: '1.5rem', marginBottom: '8px' }}>Pagamento Aprovado!</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>
              A simulação foi concluída com sucesso.<br/>
              O sistema original (Checkout) já pode avançar para a próxima etapa.
            </p>
            <Button onClick={() => window.close()} style={{ background: '#333', color: '#fff', width: '100%' }}>
              Fechar esta janela
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
