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
  const { items, subtotal, discount, totalPrice, clearCart, coupon, removeItem, freeShipping } = useCart()
  const [step, setStep] = useState(1) // 1: Info, 2: Entrega, 3: Pagamento
  
  // Form Info
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
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
  const [trackedCheckout, setTrackedCheckout] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [savedAddresses, setSavedAddresses] = useState<any[]>([])

  const applyAddress = (addr: any) => {
    if (addr.zip_code) {
      const cleanCep = addr.zip_code.replace(/\D/g, '')
      setCep(cleanCep)
    }
    if (addr.street) setLogradouro(addr.street)
    if (addr.number) setNumero(addr.number)
    if (addr.neighborhood) setBairro(addr.neighborhood)
    if (addr.city) setCidade(addr.city)
    if (addr.complement) setComplemento(addr.complement)
    if (addr.reference) setReferencia(addr.reference)
  }

  useEffect(() => {
    async function loadProfile() {
      // Lazy load the client only when mounting the component
      const { createClient } = await import('@kings/db/client')
      const supabase = createClient()
      const { data: { user } } = await (supabase.auth as any).getUser()
      
      if (user) {
        setEmail(user.email || '')
        const { data: profile } = await supabase.from('profiles').select('*').or(`id.eq.${user.id},auth_id.eq.${user.id}`).maybeSingle()
        
        if (profile) {
          if (profile.full_name) setNome(profile.full_name)
          if (profile.cpf_cnpj) setCpf(profile.cpf_cnpj)
          if (profile.phone) setTelefone(profile.phone)
          
          if (profile.addresses && Array.isArray(profile.addresses) && profile.addresses.length > 0) {
            setSavedAddresses(profile.addresses)
            const defaultAddr = profile.addresses.find((a: any) => a.is_default) || profile.addresses[0]
            if (defaultAddr) {
              applyAddress(defaultAddr)
            }
          }
        }
      } else {
        // Usuário não está logado
        setShowAuthModal(true)
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

  // Track InitiateCheckout
  useEffect(() => {
    if (items.length > 0 && !trackedCheckout && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_ids: items.map(i => i.id),
        value: totalPrice,
        currency: 'BRL',
        num_items: items.reduce((acc, i) => acc + i.quantity, 0)
      })
      setTrackedCheckout(true)
    }
  }, [items, trackedCheckout, totalPrice])

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

  // Agrupar itens por loja
  const groups = items.reduce((acc, item) => {
    const brand = item.brand || 'kings'
    const store = brand.toLowerCase().includes('seven') ? 'seven' : (brand.toLowerCase().includes('msu') ? 'msu' : 'kings')
    if (!acc[store]) acc[store] = []
    acc[store].push(item)
    return acc
  }, {} as Record<string, typeof items>)

  const storeNames = Object.keys(groups)

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
      let storeOptions: Record<string, any[]> = {}
      
      for (const store of storeNames) {
        const storeItems = groups[store]
        const res = await fetch('/api/shipping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destinationZip: targetCep,
            store: store,
            items: storeItems.map(i => ({ 
              id: i.id, 
              quantity: i.quantity,
              weight: i.dimensions?.weight,
              width: i.dimensions?.width,
              height: i.dimensions?.height,
              length: i.dimensions?.length
            }))
          })
        })
        const data = await res.json()
        storeOptions[store] = data.options && data.options.length > 0 ? data.options : []
      }

      // Aggregate options
      if (storeNames.length === 1) {
        const opts = storeOptions[storeNames[0]] || []
        setFretes(opts)
        setSelectedFrete(opts.length > 0 ? opts[0] : null)
      } else {
        // Múltiplas lojas: soma as opções mais baratas para criar um frete único combinado
        let totalCheapest = 0
        let maxTime = 0
        let allValid = true

        for (const store of storeNames) {
          const opts = storeOptions[store]
          if (!opts || opts.length === 0) {
            allValid = false
            break
          }
          // The API already sorts by price, so [0] is cheapest
          const cheapest = opts[0]
          totalCheapest += parseFloat(cheapest.price)
          if (parseInt(cheapest.delivery_time) > maxTime) maxTime = parseInt(cheapest.delivery_time)
        }

        if (allValid) {
          const combinedOption = {
            id: 'combined_shipping',
            name: 'Frete Padrão (Múltiplas Origens)',
            company: { name: 'Logística Parceira', picture: '' },
            price: totalCheapest.toFixed(2),
            currency: 'R$',
            custom_delivery_time: maxTime,
            delivery_time: maxTime,
          }
          setFretes([combinedOption])
          setSelectedFrete(combinedOption)
        } else {
          setFretes([])
          setSelectedFrete(null)
        }
      }
      setStep(2)
    } catch (err) {
      setFretes([])
      setSelectedFrete(null)
      setStep(2)
    }
  }

  if (items.length === 0 && step === 1) return null

  const valorFrete = freeShipping ? 0 : (selectedFrete ? parseFloat(selectedFrete.price) : 0)
  const totalGeral = totalPrice + valorFrete

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
          customer: { nome, email, cpf, telefone },
          address: { cep, logradouro, numero, bairro, cidade, complemento, referencia },
          shipping: storeShipping,
          total: storeTotal,
          coupon_id: currentStoreIdx === 0 && coupon ? coupon.id : null
        })
      })
      
      const session = await res.json()
      
      if (session.ok && session.init_point) {
        // Redireciona o cliente para o checkout real do Mercado Pago
        // NÃO limpa o carrinho aqui, para evitar perda se ele fechar a janela.
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

  const handlePixPayment = async () => {
    setIsProcessing(true)
    const currentStore = storeNames[currentStoreIdx]
    const storeGroupItems = groups[currentStore]

    const storeShipping = currentStoreIdx === 0 ? selectedFrete : null
    const shippingPrice = currentStoreIdx === 0 ? valorFrete : 0

    // Aplica 10% de desconto em CADA item para o Pix
    const pixItems = storeGroupItems.map(i => ({
      ...i,
      price: parseFloat((i.price * 0.9).toFixed(2))
    }))

    const storeSubtotal = pixItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
    const storeDiscount = currentStoreIdx === 0 ? discount : 0
    const storeTotal = storeSubtotal + shippingPrice - storeDiscount

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pixItems,
          customer: { nome, email, cpf, telefone },
          address: { cep, logradouro, numero, bairro, cidade, complemento, referencia },
          shipping: storeShipping,
          total: storeTotal,
          coupon_id: currentStoreIdx === 0 && coupon ? coupon.id : null,
          pix_discount: true
        })
      })

      const session = await res.json()

      if (session.ok && session.init_point) {
        // Redireciona o cliente para o checkout real do Mercado Pago
        // NÃO limpa o carrinho aqui, para evitar perda se ele fechar a janela.
        window.location.href = session.init_point
      } else {
        setCheckoutError(session.error || 'Não foi possível iniciar o pagamento. Tente novamente.')
        setIsProcessing(false)
      }
    } catch (err) {
      console.error(err)
      setCheckoutError('Erro de comunicação com o servidor.')
      setIsProcessing(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: 'transparent', paddingTop: '100px' }}>

      {showAuthModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(10, 14, 26, 0.95)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#111827', border: '1px solid rgba(0, 229, 255, 0.3)', borderRadius: '16px', padding: '40px', maxWidth: '450px', width: '100%', textAlign: 'center', boxShadow: '0 20px 40px rgba(0, 229, 255, 0.1)' }}>
            <div style={{ width: '64px', height: '64px', background: 'rgba(0, 229, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            </div>
            <h2 style={{ color: '#fff', marginBottom: '16px', fontSize: '1.5rem', fontWeight: 700 }}>Identificação Necessária</h2>
            <p style={{ color: '#94a3b8', marginBottom: '32px', lineHeight: 1.6, fontSize: '0.95rem' }}>
              Para simular o frete e finalizar sua compra de forma segura, faça um rápido login ou crie sua conta.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button onClick={() => router.push('/login?redirect=/checkout')} style={{ width: '100%', padding: '14px', fontSize: '1.05rem', fontWeight: 600 }}>Fazer Login / Criar Conta</Button>
              <button onClick={() => router.push('/')} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 500, transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>Continuar Comprando</button>
            </div>
          </div>
        </div>
      )}
      
      <Container style={{ position: 'relative', zIndex: 1, paddingBottom: '100px' }}>
        <div className="kings-checkout-grid">
          
          {/* Coluna Esquerda: Fluxo */}
          <div style={{ background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '2rem' }}>Finalizar Compra</h1>
            
            {step === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>1. Seus Dados</h2>
                <div className="kings-checkout-form-grid">
                  <input type="text" placeholder="Nome Completo *" value={nome} onChange={e => setNome(e.target.value)} style={{...inputStyle, flex: 1, border: (!nome || nome.trim().length < 3) ? '1px solid #ef4444' : inputStyle.border }} />
                  <input type="text" placeholder="CPF *" value={cpf} onChange={e => setCpf(e.target.value)} style={{...inputStyle, flex: 1, border: (!cpf || cpf.trim().length < 11) ? '1px solid #ef4444' : inputStyle.border }} />
                </div>
                <div className="kings-checkout-form-grid">
                  <input type="email" placeholder="E-mail *" value={email} onChange={e => setEmail(e.target.value)} style={{...inputStyle, flex: 1, border: (!email || email.trim().length < 5) ? '1px solid #ef4444' : inputStyle.border }} />
                  <input type="tel" placeholder="Telefone / WhatsApp *" value={telefone} onChange={e => setTelefone(e.target.value)} style={{...inputStyle, flex: 1, border: (!telefone || telefone.trim().length < 10) ? '1px solid #ef4444' : inputStyle.border }} />
                </div>
                
                {(!nome || !cpf || !email || !telefone || cpf.trim().length < 11 || telefone.trim().length < 10) && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-8px' }}>Preencha corretamente os campos obrigatórios (*) destacados em vermelho para gerar a Nota Fiscal.</p>
                )}
                
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
                
                {!isRetirada && savedAddresses.length > 0 && (
                  <div style={{ marginBottom: '1rem', marginTop: '-0.5rem' }}>
                    <select 
                      onChange={(e) => {
                        const addr = savedAddresses.find(a => a.id === e.target.value)
                        if (addr) applyAddress(addr)
                      }}
                      style={{...inputStyle, background: 'rgba(0, 229, 255, 0.05)', border: '1px solid rgba(0, 229, 255, 0.3)', color: '#00e5ff', cursor: 'pointer', appearance: 'none' }}
                    >
                      <option value="" disabled selected>Usar endereço salvo...</option>
                      {savedAddresses.map(addr => (
                        <option key={addr.id} value={addr.id} style={{ color: '#000' }}>
                          {addr.street}, {addr.number} - {addr.neighborhood || addr.city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

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
                
                <Button 
                  onClick={() => {
                    if (nome.trim().length < 3) return alert('Por favor, informe seu Nome Completo.');
                    if (cpf.trim().length < 11) return alert('Por favor, informe um CPF válido para a Nota Fiscal.');
                    if (email.trim().length < 5) return alert('Por favor, informe um E-mail válido.');
                    if (telefone.trim().length < 10) return alert('Por favor, informe um Telefone/WhatsApp válido com DDD.');
                    if (!isRetirada && cep.length < 8) return alert('Por favor, informe o CEP de entrega corretamente.');
                    calcularFretes();
                  }} 
                  style={{ marginTop: '1rem' }}
                >
                  {isRetirada ? 'Continuar para Pagamento' : 'Continuar para Frete'}
                </Button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', color: '#00e5ff' }}>2. Opções de Entrega</h2>
                {!isRetirada && <p style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Enviando para: {logradouro}, {numero} - {cep}</p>}

                {freeShipping && fretes.length > 0 ? (
                  // Frete grátis por cupom: loja escolhe o modal, cliente não pode alterar
                  <>
                    <div style={{
                      padding: '16px 20px', borderRadius: '10px',
                      background: 'linear-gradient(135deg, rgba(6,214,160,0.12), rgba(6,214,160,0.05))',
                      border: '1px solid rgba(6,214,160,0.4)',
                      display: 'flex', alignItems: 'center', gap: '14px'
                    }}>
                      <span style={{ fontSize: '1.8rem' }}>🎁</span>
                      <div>
                        <div style={{ color: '#06d6a0', fontWeight: 700, fontSize: '0.95rem' }}>
                          Frete Grátis — Cortesia da Kings!
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px', lineHeight: 1.4 }}>
                          Seu cupom cobre o custo do envio. A modalidade de entrega será definida pela loja para garantir o melhor custo-benefício.
                        </div>
                      </div>
                    </div>

                    <div className="kings-btn-row">
                      <Button variant="secondary" onClick={() => setStep(1)}>Voltar</Button>
                      <Button onClick={() => setStep(3)} style={{ flex: 1 }}>Continuar para Pagamento</Button>
                    </div>
                  </>
                ) : fretes.length > 0 ? (
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

                {checkoutError && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '0.5rem', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ color: '#f87171', fontWeight: 600, fontSize: '0.95rem' }}>⚠️ {checkoutError}</div>
                    <button onClick={() => setCheckoutError('')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', textAlign: 'left', padding: 0 }}>Fechar</button>
                  </div>
                )}

                {/* Botão Pix com desconto */}
                <button
                  disabled={isProcessing}
                  onClick={handlePixPayment}
                  style={{
                    width: '100%', padding: '18px', borderRadius: '12px', border: '2px solid rgba(0,229,255,0.5)',
                    background: 'linear-gradient(135deg, rgba(0,229,255,0.12), rgba(0,229,255,0.05))',
                    color: '#fff', cursor: isProcessing ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s', opacity: isProcessing ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem' }}>⚡</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700, fontSize: '1rem', color: '#00e5ff' }}>Pagar com Pix</div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>10% de desconto — aprovado na hora</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#00e5ff' }}>{(totalGeral * 0.9).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'line-through' }}>{totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                  </div>
                </button>

                {/* Separador */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>ou</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>

                {/* Botão Cartão/Boleto */}
                <button
                  disabled={isProcessing}
                  onClick={handleMultistepPayment}
                  style={{
                    width: '100%', padding: '16px', borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.04)',
                    color: '#cbd5e1', cursor: isProcessing ? 'wait' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    transition: 'all 0.2s', opacity: isProcessing ? 0.7 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '1.8rem' }}>💳</span>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Cartão ou Boleto</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Até 12x sem juros no cartão</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <img src="https://http2.mlstatic.com/frontend-assets/mp-web-navigation/ui-navigation/5.19.1/mercadopago/logo__large.png" alt="Mercado Pago" style={{ height: '20px', background: '#fff', padding: '2px 6px', borderRadius: '4px' }} />
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Pagamento 100% seguro via Mercado Pago</span>
                </div>

                <div className="kings-btn-row" style={{ marginTop: '4px' }}>
                  <Button variant="secondary" onClick={() => setStep(2)}>Voltar</Button>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', color: freeShipping ? '#06d6a0' : '#a1a1aa' }}>
                <span>Frete</span>
                <span>{freeShipping ? '🎉 Grátis' : (valorFrete > 0 ? formatPrice(valorFrete) : '--')}</span>
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
