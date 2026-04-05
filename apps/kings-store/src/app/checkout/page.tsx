'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Container } from '@kings/ui'
import { StreamingBackground } from '@kings/ui'
import { useCart } from '../../contexts/CartContext'
import { formatPrice } from '@kings/utils'
import { calculateShipping } from '@kings/shipping'
import { createPreference } from '@kings/payments'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState(1) // 1: Info, 2: Entrega, 3: Pagamento
  
  // Form Info
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  
  const [fretes, setFretes] = useState<any[]>([])
  const [selectedFrete, setSelectedFrete] = useState<any>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)

  // Redirect to home if empty cart
  useEffect(() => {
    if (items.length === 0 && step === 1) {
      router.push('/')
    }
  }, [items, router, step])

  const preencherCep = async () => {
    if (cep.length >= 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`)
        const data = await res.json()
        if (!data.erro) {
          setLogradouro(`${data.logradouro}, ${data.bairro} - ${data.localidade}/${data.uf}`)
        }
      } catch (err) {
        // ignore
      }
    }
  }

  const calcularFretesMock = async () => {
    const fakeDimensions = [
      { weight: 25, width: 60, height: 60, length: 60 }
    ]
    const simulados = await calculateShipping('01001000', cep, fakeDimensions)
    setFretes(simulados)
    setSelectedFrete(simulados[0]) // Select PAC by default
    setStep(2)
  }

  const handlePagamentoMock = async () => {
    setIsProcessing(true)
    
    // Simulate Supabase order creation via API Route
    const totalComFrete = totalPrice + (selectedFrete ? parseFloat(selectedFrete.price) : 0)
    
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: { nome, email, cpf },
          address: { cep, logradouro, numero },
          shipping: selectedFrete,
          total: totalComFrete
        })
      })
      
      const session = await res.json()
      
      if (session.ok) {
        clearCart()
        router.push(`/account?order=${session.orderId}`)
      }
    } catch (err) {
      console.error(err)
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && step === 1) return null

  const valorFrete = selectedFrete ? parseFloat(selectedFrete.price) : 0

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#06080F', paddingTop: '100px' }}>
      <StreamingBackground />
      
      <Container style={{ position: 'relative', zIndex: 1, paddingBottom: '100px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '2rem', alignItems: 'start' }}>
          
          {/* Coluna Esquerda: Fluxo */}
          <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '2rem' }}>Finalizar Compra</h1>
            
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>1. Seus Dados</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} style={inputStyle} />
                  <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} style={inputStyle} />
                </div>
                <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff', marginTop: '1rem' }}>Endereço de Entrega</h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" placeholder="CEP" value={cep} onChange={e => setCep(e.target.value)} onBlur={preencherCep} style={{...inputStyle, width: '150px'}} />
                  <input type="text" placeholder="Logradouro" value={logradouro} onChange={e => setLogradouro(e.target.value)} style={{...inputStyle, flex: 1}} />
                  <input type="text" placeholder="Nº" value={numero} onChange={e => setNumero(e.target.value)} style={{...inputStyle, width: '80px'}} />
                </div>
                
                <Button onClick={calcularFretesMock} style={{ marginTop: '1rem' }}>Continuar para Frete</Button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>2. Opções de Entrega</h2>
                <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Enviando para: {logradouro}, {numero} - {cep}</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {fretes.map(f => (
                    <div 
                      key={f.id} 
                      onClick={() => setSelectedFrete(f)}
                      style={{ 
                        padding: '1rem', 
                        border: selectedFrete?.id === f.id ? '1px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)', 
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        background: selectedFrete?.id === f.id ? 'rgba(0, 229, 255, 0.05)' : 'transparent'
                      }}>
                      <div>
                        <strong style={{ color: '#fff' }}>{f.company} {f.name}</strong>
                        <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Chega em até {f.custom_delivery_time} dias úteis</div>
                      </div>
                      <div style={{ color: '#00e5ff', fontWeight: 600 }}>
                        {formatPrice(parseFloat(f.price))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                  <Button onClick={() => setStep(3)} style={{ flex: 1 }}>Continuar para Pagamento</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>3. Pagamento</h2>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                  <p style={{ color: '#fff', marginBottom: '1rem', textAlign: 'center' }}>
                    Escolha a forma de pagamento (Mock Sandbox)
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#00e5ff', cursor: 'pointer' }}>Pix</div>
                    <div style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', textAlign: 'center', color: '#a1a1aa', cursor: 'not-allowed' }}>Cartão de Crédito</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                  <Button onClick={handlePagamentoMock} style={{ flex: 1 }}>{isProcessing ? 'Processando...' : 'Finalizar Compra Segura'}</Button>
                </div>
              </div>
            )}
            
          </div>

          {/* Coluna Direita: Resumo */}
          <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Resumo da Vida</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ width: '50px', height: '50px', background: '#111', borderRadius: '4px' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#fff', fontSize: '0.9rem', lineHeight: 1.2 }}>{item.title}</div>
                    <div style={{ color: '#a1a1aa', fontSize: '0.8rem' }}>Qtd: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Subtotal</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Frete</span>
                <span>{valorFrete > 0 ? formatPrice(valorFrete) : '--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Total</span>
                <span style={{ color: '#00e5ff' }}>{formatPrice(totalPrice + valorFrete)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </Container>
    </div>
  )
}

const inputStyle = {
  background: 'rgba(0,0,0,0.5)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '0.5rem',
  padding: '0.75rem',
  color: '#fff',
  width: '100%',
  outline: 'none'
}
