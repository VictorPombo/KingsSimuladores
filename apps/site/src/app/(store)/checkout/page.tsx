'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Container } from '@kings/ui'

import { useCart } from '@/contexts/CartContext'
import { formatPrice } from '@kings/utils'
// createPreference é chamado server-side na /api/checkout, não precisa importar aqui
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
  
  const [isRetirada, setIsRetirada] = useState(false)
  
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentStoreIdx, setCurrentStoreIdx] = useState(0)
  const [checkoutError, setCheckoutError] = useState('')

  useEffect(() => {
    async function loadProfile() {
      // Lazy load the client only when mounting the component
      const { createClient } = await import('@kings/db/client')
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setEmail(user.email || '')
        const { data: profile } = await supabase.from('profiles').select('*').or(`id.eq.${user.id},auth_id.eq.${user.id}`).maybeSingle()
        
        if (profile) {
          if (profile.full_name) setNome(profile.full_name)
          if (profile.cpf_cnpj) setCpf(profile.cpf_cnpj)
          
          if (profile.addresses && Array.isArray(profile.addresses) && profile.addresses.length > 0) {
            const defaultAddr = profile.addresses.find((a: any) => a.isDefault) || profile.addresses[0]
            if (defaultAddr.zip_code) {
              const cleanCep = defaultAddr.zip_code.replace(/\D/g, '')
              setCep(cleanCep)
            }
            if (defaultAddr.street) setLogradouro(defaultAddr.street)
            if (defaultAddr.number) setNumero(defaultAddr.number)
            if (defaultAddr.neighborhood) setBairro(defaultAddr.neighborhood)
            if (defaultAddr.city) setCidade(defaultAddr.city)
            if (defaultAddr.complement) setComplemento(defaultAddr.complement)
          }
        }
      }
    }
    loadProfile()
  }, [])

  // Auto-fill address and calculate shipping when CEP is loaded from profile
  useEffect(() => {
    if (cep && cep.length >= 8 && step === 1) {
      preencherCep(cep)
      if (items.length > 0) {
        calcularFretes(cep)
      }
    }
  }, [cep, items])

  // Redirect to home if empty cart
  useEffect(() => {
    if (items.length === 0 && step === 1) {
      router.push('/')
    }
  }, [items, router, step])

  const preencherCep = async (overrideCep?: string) => {
    const targetCep = overrideCep || cep
    if (targetCep.length >= 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${targetCep.replace(/\D/g, '')}/json/`)
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

  const calcularFretes = async (overrideCep?: string) => {
    if (isRetirada) {
      const pickupOption = {
        id: 'pickup',
        name: 'Retirada no Local',
        company: { name: 'Kings Simuladores', picture: '' },
        price: '0.00',
        currency: 'R$',
        custom_delivery_time: 0,
        delivery_time: 0,
      }
      setFretes([pickupOption])
      setSelectedFrete(pickupOption)
      setStep(2)
      return
    }

    const targetCep = overrideCep || cep
    if (!targetCep || targetCep.length < 8) return

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationZip: targetCep,
          originZip: process.env.NEXT_PUBLIC_DEFAULT_ORIGIN_ZIP || '12929608',
          items: items.map(i => ({ id: i.id, quantity: i.quantity }))
        })
      })
      const data = await res.json()
      
      if (data.options && data.options.length > 0) {
        setFretes(data.options)
        setSelectedFrete(data.options[0]) // Select first option by default
      } else {
        setFretes([])
        setSelectedFrete(null)
      }
      setStep(2)
    } catch (err) {
      setFretes([])
      setSelectedFrete(null)
      setStep(2)
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
      
      if (session.ok && session.init_point) {
        // Redireciona o cliente para o checkout real do Mercado Pago
        clearCart()
        window.location.href = session.init_point
      } else {
        setCheckoutError(session.error || 'Não foi possível iniciar o pagamento. Tente novamente.')
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      setCheckoutError('Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.')
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
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <h2 style={{ fontSize: '1.2rem', color: '#00e5ff', margin: 0 }}>Endereço de Entrega</h2>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc', fontSize: '0.9rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '8px', border: isRetirada ? '1px solid #00e5ff' : '1px solid transparent' }}>
                    <input 
                      type="checkbox" 
                      checked={isRetirada} 
                      onChange={(e) => setIsRetirada(e.target.checked)} 
                      style={{ accentColor: '#00e5ff', width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    Quero retirar na loja (São Paulo - SP)
                  </label>
                </div>
                
                {!isRetirada && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="kings-checkout-form-row">
                      <input type="text" placeholder="CEP" value={cep} onChange={e => {
                        const val = e.target.value.replace(/\D/g, '')
                        setCep(val)
                        if (val.length === 8) {
                          preencherCep(val)
                        }
                      }} onBlur={() => preencherCep()} style={{...inputStyle, width: '150px', flexShrink: 0}} className="checkout-cep-input" />
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
                  </div>
                )}
                
                <Button onClick={() => calcularFretes()} style={{ marginTop: '1rem' }} disabled={!isRetirada && cep.length < 8}>
                  {isRetirada ? 'Continuar para Pagamento' : 'Continuar para Frete'}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>2. Opções de Entrega</h2>
                {!isRetirada && <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Enviando para: {logradouro}, {numero} - {cep}</p>}
                
                {fretes.length > 0 ? (
                  <>
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
                            <strong style={{ color: '#fff' }}>{f.company?.name || ''} {f.name}</strong>
                            <div style={{ color: '#a1a1aa', fontSize: '0.85rem' }}>Chega em até {f.delivery_time || f.custom_delivery_time} dias úteis</div>
                          </div>
                          <div style={{ color: '#00e5ff', fontWeight: 600 }}>
                            {formatPrice(parseFloat(f.price))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="kings-btn-row">
                      <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                      <Button onClick={() => setStep(3)} style={{ flex: 1 }}>Continuar para Pagamento</Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', padding: '16px', borderRadius: '8px' }}>
                      <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5 }}>
                        Não foi possível calcular o frete automaticamente. Entre em contato pelo WhatsApp para finalizar seu pedido.
                      </p>
                    </div>
                    <div className="kings-btn-row">
                      <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                      <Button 
                        style={{ flex: 1, background: '#25D366', color: '#fff', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }} 
                        onClick={() => window.open(`https://wa.me/5511959018725?text=Olá, não consegui calcular o frete no site. Quero finalizar o pedido dos itens: ${items.map(i => i.title).join(', ')}. O meu CEP é ${cep}.`, '_blank')}
                      >
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                        Finalizar pelo WhatsApp
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>3. Pagamento Seguro</h2>
                
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '0.5rem', border: '1px solid rgba(0, 229, 255, 0.2)', textAlign: 'center' }}>
                  <div style={{ display: 'inline-block', marginBottom: '16px', background: '#fff', padding: '8px 16px', borderRadius: '8px' }}>
                    <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.19.1/mercadopago/logo__large.png" alt="Mercado Pago" style={{ height: '32px' }} />
                  </div>
                  <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '8px' }}>Ambiente Seguro</h3>
                  <p style={{ fontSize: '0.9rem', color: '#a1a1aa', lineHeight: 1.5 }}>
                    O pagamento é processado pelo <strong>Mercado Pago</strong>.<br/>
                    Você poderá escolher pagar via <strong>PIX, Boleto ou Cartão de Crédito</strong> na próxima tela.
                  </p>
                </div>

                {checkoutError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.95rem' }}>⚠️ {checkoutError}</div>
                    <button onClick={() => setCheckoutError('')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', padding: 0 }}>Fechar</button>
                  </div>
                )}

                <div className="kings-btn-row">
                  <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
                  <Button onClick={handleMultistepPayment} style={{ flex: 1, background: storeNames[currentStoreIdx] === 'seven' ? '#ea580c' : '#00B1EA' }} disabled={isProcessing}>
                    {isProcessing ? 'Redirecionando para o Mercado Pago...' : (storeNames.length > 1 ? `Ir para o Pagamento (${storeNames[currentStoreIdx].toUpperCase()}) - ${currentStoreIdx + 1}/${storeNames.length}` : 'Ir para o Pagamento Seguro ➔')}
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
  outline: 'none',
  boxSizing: 'border-box' as const
}
