'use client'

import React, { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Plus, Minus, Trash2, Loader2, CheckCircle, User, MapPin, Package, Truck, CreditCard, FileText, AlertTriangle } from 'lucide-react'
import { searchProducts, searchClients, createOrder } from './actions'

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

type Product = { id: string; title: string; sku: string; price: number; stock: number; images: string[] }
type CartItem = Product & { quantity: number }
type Client = { id: string; full_name: string; email: string; phone: string; cpf_cnpj: string; addresses: any }

// ─── Estilos reutilizáveis ───
const inputStyle: React.CSSProperties = {
  width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px',
  padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
}
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px' }
const sectionStyle: React.CSSProperties = { background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '28px', marginBottom: '20px' }
const sectionTitleStyle: React.CSSProperties = { fontSize: '1.1rem', fontWeight: 'bold', color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px' }

export default function CriarPedidoPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // ─── Estado do Formulário ───
  const [customerType, setCustomerType] = useState<'new' | 'existing'>('new')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearch, setClientSearch] = useState('')
  const [clientResults, setClientResults] = useState<Client[]>([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [cpfCnpj, setCpfCnpj] = useState('')
  const [phone, setPhone] = useState('')
  const [personType, setPersonType] = useState('pf')

  // Endereço
  const [cep, setCep] = useState('')
  const [receiver, setReceiver] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('SP')
  const [loadingCep, setLoadingCep] = useState(false)

  // Produtos
  const [productSearch, setProductSearch] = useState('')
  const [productResults, setProductResults] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchingProducts, setSearchingProducts] = useState(false)

  // Entrega
  const [shippingMethod, setShippingMethod] = useState('personalizado')
  const [shippingCost, setShippingCost] = useState(0)
  const [deliveryDays, setDeliveryDays] = useState(1)
  const [notes, setNotes] = useState('')

  // Pagamento
  const [generatePaymentLink, setGeneratePaymentLink] = useState(false)
  const [applyDiscount, setApplyDiscount] = useState(false)
  const [discount, setDiscount] = useState(0)

  // Resultado
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // ─── CEP Auto-fill ───
  async function handleCepBlur() {
    const cleanCep = cep.replace(/\D/g, '')
    if (cleanCep.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setStreet(data.logradouro || '')
        setNeighborhood(data.bairro || '')
        setCity(data.localidade || '')
        setState(data.uf || 'SP')
      }
    } catch {}
    setLoadingCep(false)
  }

  // ─── Busca de Produtos ───
  async function handleProductSearch() {
    if (!productSearch.trim()) return
    setSearchingProducts(true)
    try {
      const results = await searchProducts(productSearch)
      setProductResults(results as any)
    } catch {}
    setSearchingProducts(false)
  }

  // ─── Busca de Clientes ───
  async function handleClientSearch() {
    if (!clientSearch.trim()) return
    try {
      const results = await searchClients(clientSearch)
      setClientResults(results as any)
    } catch {}
  }

  function selectClient(client: Client) {
    setSelectedClient(client)
    setEmail(client.email || '')
    setName(client.full_name || '')
    setCpfCnpj(client.cpf_cnpj || '')
    setPhone(client.phone || '')
    setClientResults([])
    // Preencher endereço se tiver
    if (client.addresses && Array.isArray(client.addresses) && client.addresses.length > 0) {
      const addr = client.addresses[0]
      setCep(addr.cep || ''); setStreet(addr.street || ''); setNumber(addr.number || '')
      setNeighborhood(addr.neighborhood || ''); setCity(addr.city || ''); setState(addr.state || 'SP')
      setReceiver(client.full_name || '')
    }
  }

  // ─── Carrinho ───
  function addToCart(product: Product) {
    const existing = cart.find(i => i.id === product.id)
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i))
    } else {
      setCart([...cart, { ...product, quantity: 1 }])
    }
  }

  function updateQty(id: string, delta: number) {
    setCart(cart.map(i => {
      if (i.id !== id) return i
      const newQty = Math.max(1, Math.min(i.stock, i.quantity + delta))
      return { ...i, quantity: newQty }
    }))
  }

  function removeFromCart(id: string) { setCart(cart.filter(i => i.id !== id)) }

  // ─── Cálculos ───
  const subtotal = cart.reduce((a, i) => a + i.price * i.quantity, 0)
  const finalDiscount = applyDiscount ? discount : 0
  const total = Math.max(0, subtotal + shippingCost - finalDiscount)

  // ─── Submit ───
  async function handleSubmit() {
    setError('')
    setSuccess('')
    startTransition(async () => {
      try {
        const result = await createOrder({
          customerType,
          customerId: selectedClient?.id,
          email, name, cpfCnpj, phone, personType,
          address: { cep, receiver: receiver || name, street, number, complement, neighborhood, city, state },
          items: cart.map(i => ({ productId: i.id, quantity: i.quantity, unitPrice: i.price, title: i.title })),
          shippingMethod, shippingCost, deliveryDays, notes,
          discount: finalDiscount, generatePaymentLink,
        })
        setSuccess(`Pedido #${result.orderId.split('-')[0]} criado com sucesso!`)
        setTimeout(() => router.push('/admin/pedidos'), 2000)
      } catch (err: any) {
        setError(err.message || 'Erro desconhecido.')
      }
    })
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
        <a href="/admin/pedidos" style={{
          display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)',
          border: '1px solid #3f424d', borderRadius: '8px', padding: '8px 14px', color: '#cbd5e1',
          cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none'
        }}>
          <ArrowLeft size={16} />
        </a>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Pedidos /</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Criar pedido</h1>
        </div>
      </div>

      {/* ═══ SEÇÃO 1: DADOS DO CLIENTE ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><User size={20} color="#3b82f6" /> Dados do cliente</h2>

        {/* Radio: Tipo */}
        <div style={{ display: 'flex', gap: '24px', marginBottom: '20px' }}>
          {(['new', 'existing'] as const).map(t => (
            <label key={t} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: customerType === t ? '#fff' : '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>
              <input type="radio" checked={customerType === t} onChange={() => { setCustomerType(t); setSelectedClient(null) }}
                style={{ accentColor: '#10b981' }} />
              {t === 'new' ? 'Novo cliente' : 'Cliente existente'}
            </label>
          ))}
        </div>

        {/* Busca de cliente existente */}
        {customerType === 'existing' && (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>Buscar cliente</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" placeholder="Buscar por nome ou email..." value={clientSearch}
                onChange={e => setClientSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleClientSearch()}
                style={inputStyle}
                onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'}
                onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
              <button onClick={handleClientSearch} style={{
                background: '#10b981', border: 'none', borderRadius: '6px', padding: '10px 18px',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap'
              }}>Buscar</button>
            </div>
            {clientResults.length > 0 && (
              <div style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', marginTop: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {clientResults.map((c: any) => (
                  <div key={c.id} onClick={() => selectClient(c)}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid #3f424d', fontSize: '0.85rem', color: '#e2e8f0', transition: 'background 0.15s' }}
                    onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ fontWeight: 500 }}>{c.full_name || 'Sem nome'}</div>
                    <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{c.email}</div>
                  </div>
                ))}
              </div>
            )}
            {selectedClient && (
              <div style={{ marginTop: '8px', padding: '8px 12px', background: '#10b98118', border: '1px solid #10b98130', borderRadius: '6px', fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} /> Cliente selecionado: {selectedClient.full_name}
              </div>
            )}
          </div>
        )}

        {/* Form fields */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>E-mail *</label>
            <input type="email" placeholder="email@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>Tipo de cliente *</label>
            <select value={personType} onChange={e => setPersonType(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="pf">Pessoa Física</option>
              <option value="pj">Pessoa Jurídica</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nome completo *</label>
            <input type="text" placeholder="Digite o nome do cliente" value={name} onChange={e => setName(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>{personType === 'pf' ? 'CPF *' : 'CNPJ *'}</label>
            <input type="text" placeholder={personType === 'pf' ? '000.000.000-00' : '00.000.000/0000-00'} value={cpfCnpj} onChange={e => setCpfCnpj(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>Celular *</label>
            <input type="text" placeholder="(00) 00000-0000" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
        </div>
      </div>

      {/* ═══ SEÇÃO 2: ENDEREÇO ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><MapPin size={20} color="#f59e0b" /> Endereço</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '-12px', marginBottom: '20px' }}>Informe o CEP para preencher os dados automaticamente</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>CEP *</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="00000-000" value={cep} onChange={e => setCep(e.target.value)} onBlur={handleCepBlur} style={inputStyle}
                onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} />
              {loadingCep && <Loader2 size={16} color="#10b981" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', animation: 'spin 1s linear infinite' }} />}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Nome do recebedor *</label>
            <input type="text" placeholder="Digite aqui" value={receiver} onChange={e => setReceiver(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={labelStyle}>Endereço *</label>
            <input type="text" placeholder="Rua, Avenida..." value={street} onChange={e => setStreet(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>Número *</label>
            <input type="text" placeholder="Nº" value={number} onChange={e => setNumber(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>Complemento</label>
            <input type="text" placeholder="Ex: Casa, apartamento..." value={complement} onChange={e => setComplement(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginTop: '16px' }}>
          <div>
            <label style={labelStyle}>Bairro *</label>
            <input type="text" value={neighborhood} onChange={e => setNeighborhood(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>Cidade *</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <div>
            <label style={labelStyle}>Estado *</label>
            <select value={state} onChange={e => setState(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              {ESTADOS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ═══ SEÇÃO 3: PRODUTOS ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><Package size={20} color="#8b5cf6" /> Adicionar produtos ao pedido</h2>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input type="text" placeholder="Digite o nome do produto" value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleProductSearch()}
              style={{ ...inputStyle, paddingLeft: '40px' }}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
          <button onClick={handleProductSearch} style={{
            background: '#10b981', border: 'none', borderRadius: '6px', padding: '10px 24px',
            color: '#fff', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer'
          }}>{searchingProducts ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Buscar'}</button>
        </div>

        {/* Resultados da busca */}
        {productResults.length > 0 && (
          <div style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', padding: '8px 14px', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #3f424d' }}>
              <div>Nome do produto</div><div>Disponível</div><div>Preço</div><div></div>
            </div>
            {productResults.map((p: any) => (
              <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 60px', padding: '12px 14px', borderBottom: '1px solid #3f424d', alignItems: 'center', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <div>{p.title}</div>
                <div style={{ color: p.stock > 0 ? '#10b981' : '#ef4444' }}>{p.stock} un.</div>
                <div style={{ fontFamily: 'monospace' }}>R$ {Number(p.price).toFixed(2)}</div>
                <div>
                  <button onClick={() => addToCart(p)} disabled={p.stock <= 0} style={{
                    background: p.stock > 0 ? '#10b98118' : '#3f424d', border: `1px solid ${p.stock > 0 ? '#10b98130' : '#3f424d'}`,
                    borderRadius: '4px', padding: '4px 8px', cursor: p.stock > 0 ? 'pointer' : 'not-allowed', color: p.stock > 0 ? '#10b981' : '#64748b'
                  }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Carrinho */}
        {cart.length > 0 && (
          <div style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 120px 100px 80px', padding: '8px 14px', fontSize: '0.7rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', borderBottom: '1px solid #3f424d' }}>
              <div>Produto adicionado</div><div>Quantidade</div><div>Subtotal</div><div></div>
            </div>
            {cart.map(item => (
              <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 120px 100px 80px', padding: '12px 14px', borderBottom: '1px solid #3f424d', alignItems: 'center', fontSize: '0.85rem', color: '#e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: 500 }}>{item.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.75rem' }}>R$ {item.price.toFixed(2)} un.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => updateQty(item.id, -1)} style={{ background: '#3f424d', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#fff', display: 'flex' }}><Minus size={14} /></button>
                  <span style={{ width: '30px', textAlign: 'center', fontWeight: 600 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} style={{ background: '#3f424d', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer', color: '#fff', display: 'flex' }}><Plus size={14} /></button>
                </div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: '#10b981' }}>R$ {(item.price * item.quantity).toFixed(2)}</div>
                <div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: '#ef444418', border: '1px solid #ef444430', borderRadius: '4px', padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cart.length === 0 && productResults.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: '#64748b', fontSize: '0.85rem' }}>
            Busque pelo produto que deseja adicionar ao pedido.
          </div>
        )}
      </div>

      {/* ═══ SEÇÃO 4: ENTREGA ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><Truck size={20} color="#22d3ee" /> Informações de entrega</h2>

        {(!cep || cart.length === 0) && (
          <div style={{ padding: '12px 16px', background: '#f59e0b18', border: '1px solid #f59e0b30', borderRadius: '6px', marginBottom: '20px', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} /> Para calcular a entrega, preencha o CEP e adicione ao menos um produto.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Forma de entrega *</label>
            <select value={shippingMethod} onChange={e => setShippingMethod(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="personalizado">Personalizado</option>
              <option value="correios_pac">Correios PAC</option>
              <option value="correios_sedex">Correios SEDEX</option>
              <option value="retirada">Retirada em mãos</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Valor do frete *</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ background: '#3f424d', padding: '10px 12px', borderRadius: '6px 0 0 6px', color: '#94a3b8', fontSize: '0.85rem', border: '1px solid #3f424d', borderRight: 'none' }}>R$</span>
              <input type="number" step="0.01" value={shippingCost} onChange={e => setShippingCost(Number(e.target.value))} style={{ ...inputStyle, borderRadius: '0 6px 6px 0' }}
                onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Prazo de entrega (dias) *</label>
            <input type="number" min={1} value={deliveryDays} onChange={e => setDeliveryDays(Number(e.target.value))} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>Observação do pedido (opcional)</label>
          <textarea placeholder="Digite aqui" value={notes} onChange={e => setNotes(e.target.value)}
            style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }}
            onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
        </div>
      </div>

      {/* ═══ SEÇÃO 5: PAGAMENTO ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><CreditCard size={20} color="#10b981" /> Forma de pagamento</h2>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.9rem' }}>
          <input type="checkbox" checked={generatePaymentLink} onChange={e => setGeneratePaymentLink(e.target.checked)} style={{ accentColor: '#10b981', width: '18px', height: '18px' }} />
          Gerar link de pagamento para o pedido?
        </label>
      </div>

      {/* ═══ SEÇÃO 6: RESUMO ═══ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}><FileText size={20} color="#f59e0b" /> Resumo do pedido</h2>

        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 500 }}>Produtos selecionados:</div>
          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600, marginTop: '4px' }}>{cart.length} Produto{cart.length !== 1 ? 's' : ''} selecionado{cart.length !== 1 ? 's' : ''}</div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '16px' }}>
          <input type="checkbox" checked={applyDiscount} onChange={e => setApplyDiscount(e.target.checked)} style={{ accentColor: '#10b981' }} />
          Aplicar desconto no pedido?
        </label>

        {applyDiscount && (
          <div style={{ marginBottom: '16px', maxWidth: '250px' }}>
            <label style={labelStyle}>Valor do desconto (R$)</label>
            <input type="number" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} style={inputStyle}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'} onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'} />
          </div>
        )}

        {/* Totais */}
        <div style={{ borderTop: '1px solid #3f424d', paddingTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ textAlign: 'right', minWidth: '250px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Subtotal:</span>
              <span style={{ color: '#10b981', fontFamily: 'monospace' }}>R$ {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
              <span style={{ color: '#94a3b8' }}>Frete:</span>
              <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>+ R$ {shippingCost.toFixed(2)}</span>
            </div>
            {applyDiscount && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
                <span style={{ color: '#94a3b8' }}>Desconto:</span>
                <span style={{ color: '#ef4444', fontFamily: 'monospace' }}>- R$ {finalDiscount.toFixed(2)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid #3f424d', fontSize: '1.1rem' }}>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>Total do pedido:</span>
              <span style={{ color: '#10b981', fontWeight: 'bold', fontFamily: 'monospace' }}>R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mensagens */}
      {error && (
        <div style={{ padding: '12px 16px', background: '#ef444418', border: '1px solid #ef444430', borderRadius: '8px', marginBottom: '16px', color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '12px 16px', background: '#10b98118', border: '1px solid #10b98130', borderRadius: '8px', marginBottom: '16px', color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingBottom: '60px' }}>
        <a href="/admin/pedidos" style={{
          padding: '12px 28px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
          background: 'transparent', border: '1px solid #3f424d', color: '#cbd5e1',
          cursor: 'pointer', textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
        }}>Cancelar</a>
        <button onClick={handleSubmit} disabled={isPending || cart.length === 0} style={{
          padding: '12px 28px', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 600,
          background: cart.length > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : '#3f424d',
          border: 'none', color: '#fff', cursor: cart.length > 0 ? 'pointer' : 'not-allowed',
          boxShadow: cart.length > 0 ? '0 2px 12px rgba(16,185,129,0.3)' : 'none',
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          transition: 'all 0.2s'
        }}>
          {isPending ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Criando...</> : 'Criar pedido'}
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
