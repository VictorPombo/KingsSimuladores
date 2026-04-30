'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Container } from '@kings/ui'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@kings/utils'
import { createPreference } from '@kings/payments'
import { UpsellEngine } from '@/components/store/upsell/UpsellEngine'
import { CouponInput } from '@/components/store/cart/CouponInput'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, discount, totalPrice, clearCart, coupon, removeItem } = useCart()
  const [step, setStep] = useState(1) // 1: Info, 2: Entrega, 3: Pagamento
  
  // Form Info
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [cep, setCep] = useState('')
  const [logradouro, setLogradouro] = useState('')
  const [numero, setNumero] = useState('')
  const [bairro, setBairro] = useState('')
  const [cidade, setCidade] = useState('')
  const [complemento, setComplemento] = useState('')
  const [referencia, setReferencia] = useState('')
  
  const [fretes, setFretes] = useState<any[]>([])
  const [selectedFrete, setSelectedFrete] = useState<any>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStoreIdx, setCurrentStoreIdx] = useState(0)

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
          setLogradouro(data.logradouro || '')
          setBairro(data.bairro || '')
          setCidade(`${data.localidade || ''} / ${data.uf || ''}`)
        }
      } catch (err) {
        // ignore
      }
    }
  }

  const calcularFretes = async () => {
    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPostalCode: cep,
          items: items.map(i => ({ id: i.id, quantity: i.quantity }))
        })
      })
      const data = await res.json()
      
      if (data.options && data.options.length > 0) {
        setFretes(data.options)
        setSelectedFrete(data.options[0]) // Select first option by default
        setStep(2)
      } else {
        alert('Não foi possível calcular fretes para este CEP.')
      }
    } catch (err) {
      alert('Erro ao se comunicar com servidor de fretes.')
    }
  }

  if (items.length === 0 && step === 1) return null

  const valorFrete = selectedFrete ? parseFloat(selectedFrete.price) : 0
  // totalPrice já vem do CartContext COM o desconto aplicado
  const totalGeral = totalPrice + valorFrete

  // Agrupar itens por loja
  const groups = items.reduce((acc, item) => {
    const brand = item.brand || 'kings'
    const store = brand.toLowerCase().includes('seven') ? 'seven' : (brand.toLowerCase().includes('msu') ? 'msu' : 'kings')
    if (!acc[store]) acc[store] = []
    acc[store].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const storeNames = Object.keys(groups)


  const handleMultistepPayment = async () => {
    setIsProcessing(true)
    const currentStore = storeNames[currentStoreIdx]
    const storeGroupItems = groups[currentStore]
    
    // Simplificação: apenas cobra o frete e aplica desconto no PRIMEIRO pagamento
    const storeShipping = currentStoreIdx === 0 ? selectedFrete : null
    const shippingPrice = currentStoreIdx === 0 ? valorFrete : 0
    
    const storeSubtotal = storeGroupItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
    const storeDiscount = currentStoreIdx === 0 ? discount : 0
    const storeTotal = storeSubtotal + shippingPrice - storeDiscount

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: storeGroupItems,
          customer: { nome, email, cpf },
          address: { cep, logradouro, numero, bairro, cidade, complemento, referencia },
          shipping: storeShipping,
          total: storeTotal,
          coupon_id: currentStoreIdx === 0 && coupon ? coupon.id : null
        })
      })
      
      const session = await res.json()
      
      if (session.ok) {
        if (session.init_point) {
            // Abre o Mercado Pago em uma nova guia para ele pagar a primeira loja e não perder a tela
            window.open(session.init_point, '_blank')
        } 
        
        if (currentStoreIdx < storeNames.length - 1) {
            setCurrentStoreIdx(currentStoreIdx + 1)
            setIsProcessing(false)
        } else {
            // Concluiu todos!
            router.push(`/account`)
        }
      } else {
        alert('Erro ao iniciar pagamento: ' + (session.error || 'Tente novamente.'))
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      setIsProcessing(false)
    }
  }


  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'transparent', paddingTop: '100px' }}>

      
      <Container style={{ position: 'relative', zIndex: 1, paddingBottom: '100px' }}>
        <div className="kings-checkout-grid">
          
          {/* Coluna Esquerda: Fluxo */}
          <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '2rem' }}>Finalizar Compra</h1>
            
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>1. Seus Dados</h2>
                <div className="kings-checkout-form-grid">
                  <input type="text" placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} style={{...inputStyle, flex: 1}} />
                  <input type="text" placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} style={{...inputStyle, flex: 1}} />
                </div>
                <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff', marginTop: '1rem' }}>Endereço de Entrega</h2>
                <div className="kings-checkout-form-row">
                  <input type="text" placeholder="CEP" value={cep} onChange={e => {
                    const val = e.target.value.replace(/\D/g, '')
                    setCep(val)
                    if (val.length === 8) {
                      // Trigger fill automatically
                      preencherCep()
                    }
                  }} onBlur={preencherCep} style={{...inputStyle, width: '150px', flexShrink: 0}} className="checkout-cep-input" />
                  <input type="text" placeholder="Endereço" value={logradouro} onChange={e => setLogradouro(e.target.value)} style={{...inputStyle, flex: 2}} />
                  <input type="text" placeholder="Nº" value={numero} onChange={e => setNumero(e.target.value)} style={{...inputStyle, width: '80px', flexShrink: 0}} className="checkout-number-input" />
                </div>
                <div className="kings-checkout-form-row">
                  <input type="text" placeholder="Bairro" value={bairro} onChange={e => setBairro(e.target.value)} style={{...inputStyle, flex: 1}} />
                  <input type="text" placeholder="Cidade / UF" value={cidade} onChange={e => setCidade(e.target.value)} style={{...inputStyle, flex: 1}} />
                </div>
                <div className="kings-checkout-form-row">
                  <input type="text" placeholder="Complemento (opcional)" value={complemento} onChange={e => setComplemento(e.target.value)} style={{...inputStyle, flex: 1}} />
                  <input type="text" placeholder="Referência (opcional)" value={referencia} onChange={e => setReferencia(e.target.value)} style={{...inputStyle, flex: 1}} />
                </div>
                
                <Button onClick={calcularFretes} style={{ marginTop: '1rem' }} disabled={cep.length < 8}>Continuar para Frete</Button>
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

                <div className="btn-row">
                  <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                  <Button onClick={() => setStep(3)} style={{ flex: 1 }}>Continuar para Pagamento</Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>3. Pagamento Seguro</h2>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px dashed rgba(0, 229, 255, 0.3)' }}>
                  <p style={{ color: '#fff', marginBottom: '16px', textAlign: 'center', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    Pagamento Protegido via Mercado Pago
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', alignItems: 'center', marginBottom: '16px' }}>
                     <img src="https://img.shields.io/badge/Pix-00B1EA?style=for-the-badge&logo=pix&logoColor=white" alt="Pix" style={{ height: '32px', borderRadius: '4px' }} />
                     <img src="https://img.shields.io/badge/Mastercard-EB001B?style=for-the-badge&logo=mastercard&logoColor=white" alt="Mastercard" style={{ height: '32px', borderRadius: '4px' }} />
                     <img src="https://img.shields.io/badge/Visa-1434CB?style=for-the-badge&logo=visa&logoColor=white" alt="Visa" style={{ height: '32px', borderRadius: '4px' }} />
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#a1a1aa', textAlign: 'center', lineHeight: 1.5 }}>
                    Você será redirecionado em ambiente criptografado para o aplicativo/site oficial do <strong>Mercado Pago</strong> para inserir seus dados de Cartão de Crédito ou ler seu QR Code Pix.
                  </p>
                </div>

                <div className="btn-row">
                  <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                  <Button onClick={handleMultistepPayment} style={{ flex: 1, background: storeNames[currentStoreIdx] === 'seven' ? '#ea580c' : '#00B1EA' }} disabled={isProcessing}>
                    {isProcessing ? 'Abrindo Gatway...' : (storeNames.length > 1 ? `Ir para o Pagamento (${storeNames[currentStoreIdx].toUpperCase()}) - ${currentStoreIdx + 1}/${storeNames.length}` : 'Ir para o Pagamento')}
                  </Button>
                </div>
              </div>
            )}
            
          </div>

          {/* Coluna Direita: Resumo */}
          <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1.5rem', position: 'sticky', top: '100px' }}>
            <h2 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '1rem' }}>Resumo da Compra</h2>
            
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
                <span>{formatPrice(subtotal)}</span>
              </div>
              <CouponInput />
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#06d6a0' }}>
                  <span>Desconto ({coupon?.code})</span>
                  <span>- {formatPrice(discount)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#a1a1aa' }}>
                <span>Frete</span>
                <span>{valorFrete > 0 ? formatPrice(valorFrete) : '--'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '1.2rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <span>Total</span>
                <span style={{ color: '#00e5ff' }}>{formatPrice(totalGeral)}</span>
              </div>
            </div>

            {/* Motor de Recomendação Inteligente */}
            <UpsellEngine variant="full" maxItems={3} />
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
