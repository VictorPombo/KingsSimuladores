'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Tag, Percent, X, Search, Save, Package, Globe, MousePointerClick } from 'lucide-react'
import { createCustomerGroup, updateCustomerGroup, deleteCustomerGroup, setSegmentedProductRule } from './actions'

type Group = { id: string; name: string; discount_percent: number; apply_to_all_products: boolean }
type Product = { id: string; title: string; sku: string; price: number }
type PriceOverride = { id: string; product_id: string; group_id: string; price: number | null; status: 'active' | 'ignored' }

export function SegmentedPricesClient({ 
  initialGroups = [], 
  products = [], 
  initialOverrides = [] 
}: { 
  initialGroups: Group[], 
  products: Product[], 
  initialOverrides: PriceOverride[] 
}) {
  const [groups, setGroups] = useState(initialGroups)
  const [overrides, setOverrides] = useState(initialOverrides)
  const [isPending, startTransition] = useTransition()
  
  const [activeGroup, setActiveGroup] = useState<Group | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<Partial<Group> | null>(null)

  // Search in table
  const [search, setSearch] = useState('')

  // Temporarily store local edits before saving
  const [localPrices, setLocalPrices] = useState<Record<string, string>>({})

  const handleSaveGroup = () => {
    if (!editingGroup?.name) return
    startTransition(async () => {
      const discount = Number(editingGroup.discount_percent) || 0
      const applyAll = editingGroup.apply_to_all_products ?? true
      
      if (editingGroup.id) {
        const res = await updateCustomerGroup(editingGroup.id, editingGroup.name!, discount, applyAll)
        if (res.success && res.data) {
          setGroups(g => g.map(x => x.id === res.data.id ? res.data : x))
          if (activeGroup?.id === editingGroup.id) setActiveGroup(res.data)
        }
      } else {
        const res = await createCustomerGroup(editingGroup.name!, discount, applyAll)
        if (res.success && res.data) setGroups([...groups, res.data])
      }
      setModalOpen(false)
    })
  }

  const handleDeleteGroup = (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja deletar o grupo "${name}"?`)) {
      startTransition(async () => {
        const res = await deleteCustomerGroup(id)
        if (res.success) {
          setGroups(g => g.filter(x => x.id !== id))
          if (activeGroup?.id === id) setActiveGroup(null)
        }
      })
    }
  }

  const handleProductRuleChange = (productId: string, newRule: 'normal' | 'base_discount' | 'fixed') => {
    if (!activeGroup) return
    // If selecting fixed, we don't save immediately, we wait for user to type and hit save icon
    if (newRule === 'fixed') {
      const existing = overrides.find(o => o.product_id === productId && o.group_id === activeGroup.id)
      setLocalPrices({ ...localPrices, [productId]: existing?.price ? String(existing.price) : '' })
      return
    }

    // Save Normal or Base Discount
    startTransition(async () => {
      const res = await setSegmentedProductRule(productId, activeGroup.id, newRule, null, activeGroup.apply_to_all_products)
      if (res.success) {
        updateLocalOverrideState(productId, newRule, null)
      }
    })
  }

  const handleFixedPriceSave = (productId: string) => {
    if (!activeGroup) return
    const rawVal = localPrices[productId]
    startTransition(async () => {
      const parsedVal = rawVal && rawVal.trim() !== '' ? parseFloat(rawVal) : null
      if (parsedVal === null || isNaN(parsedVal)) return

      const res = await setSegmentedProductRule(productId, activeGroup.id, 'fixed', parsedVal, activeGroup.apply_to_all_products)
      
      if (res.success) {
        updateLocalOverrideState(productId, 'fixed', parsedVal)
        const newLocal = { ...localPrices }
        delete newLocal[productId]
        setLocalPrices(newLocal)
      }
    })
  }

  const updateLocalOverrideState = (productId: string, rule: 'normal' | 'base_discount' | 'fixed', price: number | null) => {
    if (!activeGroup) return
    setOverrides(prev => {
      const filtered = prev.filter(o => !(o.product_id === productId && o.group_id === activeGroup.id))
      
      let shouldAdd = false
      let status: 'active' | 'ignored' = 'active'
      
      if (activeGroup.apply_to_all_products) {
        if (rule === 'normal') { shouldAdd = true; status = 'ignored'; }
        if (rule === 'fixed') { shouldAdd = true; status = 'active'; }
      } else {
        if (rule === 'base_discount') { shouldAdd = true; status = 'active'; }
        if (rule === 'fixed') { shouldAdd = true; status = 'active'; }
      }

      if (shouldAdd) {
        filtered.push({ id: `temp-${Date.now()}`, product_id: productId, group_id: activeGroup.id, price, status })
      }
      return filtered
    })
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const fmt = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      {/* Sidebar: Grupos */}
      <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersIcon /> Grupos
          </h2>
          <button onClick={() => { setEditingGroup({ name: '', discount_percent: 0, apply_to_all_products: true }); setModalOpen(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} /> Novo
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {groups.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', background: '#2c2e36', borderRadius: '8px', border: '1px dashed #3f424d' }}>
              Nenhum grupo cadastrado.
            </div>
          ) : groups.map(g => (
            <div key={g.id} 
              onClick={() => setActiveGroup(g)}
              style={{
                background: activeGroup?.id === g.id ? 'rgba(139,92,246,0.1)' : '#2c2e36',
                border: `1px solid ${activeGroup?.id === g.id ? '#8b5cf6' : '#3f424d'}`,
                borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: activeGroup?.id === g.id ? '#fff' : '#e2e8f0' }}>{g.name}</h3>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button onClick={(e) => { e.stopPropagation(); setEditingGroup(g); setModalOpen(true) }} title="Editar" style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={14} /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id, g.name) }} title="Remover" style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981', marginBottom: '4px' }}>
                <Percent size={12} /> {g.discount_percent}% de desconto base
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                {g.apply_to_all_products ? <Globe size={12} /> : <MousePointerClick size={12} />}
                {g.apply_to_all_products ? 'Aplica no site todo por padrão' : 'Aplica apenas em produtos selecionados'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Tabela de Preços */}
      <div style={{ flex: '3 1 500px', background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', padding: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!activeGroup ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <Tag size={48} style={{ marginBottom: '24px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>Como funcionam as Tabelas de Preço?</h3>
            <div style={{ maxWidth: '500px', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>O recurso de Preços Segmentados permite criar regras comerciais personalizadas para diferentes tipos de clientes. Você trabalha nas seguintes opções:</p>
              
              <div style={{ background: '#1e293b', borderLeft: '3px solid #64748b', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>1. Preço Normal (Inativo)</strong>
                O desconto do grupo é ignorado e o produto mantém o seu preço original. Útil se você tem produtos com margem apertada.
              </div>

              <div style={{ background: '#1e293b', borderLeft: '3px solid #8b5cf6', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>2. Desconto Base</strong>
                O sistema usa a porcentagem do grupo como desconto. Ex: Se o grupo tem 20%, o produto fica 20% mais barato automaticamente.
              </div>
              
              <div style={{ background: '#1e293b', borderLeft: '3px solid #10b981', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>3. Preço Fixo</strong>
                Você define um valor exato gravado na pedra para aquele produto e grupo, sobrepondo qualquer outra regra.
              </div>

            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #3f424d', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px 0' }}>Tabela: {activeGroup.name}</h2>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <span style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Percent size={14} /> {activeGroup.discount_percent}% de desconto
                  </span>
                  <span style={{ color: activeGroup.apply_to_all_products ? '#8b5cf6' : '#f59e0b', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {activeGroup.apply_to_all_products ? <Globe size={14} /> : <MousePointerClick size={14} />} 
                    {activeGroup.apply_to_all_products ? 'Modo: Site Todo' : 'Modo: Produtos Selecionados'}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', background: '#1f2025', borderRadius: '8px', padding: '10px 16px', marginBottom: '16px', border: '1px solid #3f424d' }}>
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="Buscar produto por nome ou SKU..." 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', marginLeft: '12px', fontSize: '0.9rem' }} 
              />
            </div>

            <div style={{ overflowX: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #3f424d', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Produto</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Preço Original</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Regra Aplicada</th>
                    <th style={{ padding: '12px', fontWeight: 600 }}>Preço Final</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const override = overrides.find(o => o.product_id === p.id && o.group_id === activeGroup.id)
                    const isManualEditing = localPrices[p.id] !== undefined
                    
                    // Determine current active rule
                    let currentRule: 'normal' | 'base_discount' | 'fixed' = activeGroup.apply_to_all_products ? 'base_discount' : 'normal'
                    if (override) {
                      if (override.status === 'ignored') currentRule = 'normal'
                      else if (override.price !== null) currentRule = 'fixed'
                      else currentRule = 'base_discount'
                    }

                    if (isManualEditing) currentRule = 'fixed' // Force visual to fixed if typing

                    // Calculate visual final price
                    let finalPrice = p.price
                    if (currentRule === 'base_discount') finalPrice = p.price * (1 - (activeGroup.discount_percent / 100))
                    else if (currentRule === 'fixed' && !isManualEditing && override?.price) finalPrice = override.price

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #3f424d20' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={16} color="#8b5cf6" /> {p.title}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', paddingLeft: '24px' }}>SKU: {p.sku || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {fmt(p.price)}
                        </td>
                        
                        <td style={{ padding: '12px' }}>
                          <select 
                            disabled={isPending}
                            value={currentRule}
                            onChange={(e) => handleProductRuleChange(p.id, e.target.value as any)}
                            style={{ 
                              background: '#1f2025', 
                              border: `1px solid ${currentRule === 'normal' ? '#3f424d' : currentRule === 'base_discount' ? '#8b5cf6' : '#10b981'}`, 
                              color: '#fff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' 
                            }}
                          >
                            <option value="normal">Normal (Sem desc.)</option>
                            <option value="base_discount">Desconto Base (-{activeGroup.discount_percent}%)</option>
                            <option value="fixed">Preço Fixo Customizado</option>
                          </select>
                        </td>

                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
                            {currentRule === 'fixed' ? (
                              <>
                                <div style={{ display: 'flex', alignItems: 'center', background: '#1f2025', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px' }}>
                                  <span style={{ color: '#10b981', fontSize: '0.85rem', marginRight: '4px' }}>R$</span>
                                  <input 
                                    type="number" 
                                    placeholder="0.00"
                                    value={localPrices[p.id] ?? (override?.price || '')}
                                    onChange={e => setLocalPrices({ ...localPrices, [p.id]: e.target.value })}
                                    style={{ width: '70px', background: 'transparent', border: 'none', color: '#10b981', outline: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}
                                  />
                                </div>
                                {isManualEditing && (
                                  <button onClick={() => handleFixedPriceSave(p.id)} disabled={isPending}
                                    style={{ padding: '6px', background: '#10b98120', border: '1px solid #10b981', borderRadius: '6px', color: '#10b981', cursor: 'pointer', display: 'flex' }}>
                                    <Save size={14} />
                                  </button>
                                )}
                              </>
                            ) : (
                              <span style={{ fontSize: '0.9rem', fontWeight: currentRule === 'base_discount' ? 600 : 400, color: currentRule === 'base_discount' ? '#8b5cf6' : '#94a3b8' }}>
                                {fmt(finalPrice)}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal Grupo */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e1e1e', borderRadius: '12px', width: '450px', border: '1px solid #3f424d', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #3f424d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{editingGroup?.id ? 'Editar Grupo' : 'Novo Grupo'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '8px', fontWeight: 600 }}>Nome do Grupo</label>
                <input 
                  type="text" 
                  value={editingGroup?.name || ''} 
                  onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  placeholder="Ex: Revendedores Ouro"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #3f424d', background: '#2c2e36', color: '#fff', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#e2e8f0', marginBottom: '8px', fontWeight: 600 }}>Desconto Base (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#2c2e36', border: '1px solid #3f424d', borderRadius: '6px', padding: '0 14px' }}>
                  <input 
                    type="number" 
                    value={editingGroup?.discount_percent || 0} 
                    onChange={e => setEditingGroup({ ...editingGroup, discount_percent: Number(e.target.value) })}
                    style={{ flex: 1, padding: '12px 0', background: 'transparent', border: 'none', color: '#10b981', outline: 'none', fontWeight: 600, fontSize: '1rem' }}
                  />
                  <Percent size={16} color="#64748b" />
                </div>
              </div>

              <div style={{ background: '#2c2e36', padding: '16px', borderRadius: '8px', border: '1px solid #3f424d' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={editingGroup?.apply_to_all_products ?? true}
                    onChange={e => setEditingGroup({ ...editingGroup, apply_to_all_products: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#8b5cf6', cursor: 'pointer' }}
                  />
                  <div>
                    <span style={{ display: 'block', color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>Aplicar no Site Todo por padrão</span>
                    <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', marginTop: '2px' }}>
                      {(editingGroup?.apply_to_all_products ?? true) ? 
                        "Todos os produtos herdarão o desconto. Você poderá remover itens específicos." : 
                        "Só receberá desconto o produto que você adicionar manualmente na lista."}
                    </span>
                  </div>
                </label>
              </div>

            </div>

            <div style={{ padding: '16px 24px', background: '#18181b', borderTop: '1px solid #3f424d', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button disabled={isPending} onClick={() => setModalOpen(false)} style={{ padding: '8px 16px', borderRadius: '6px', background: 'transparent', border: '1px solid #3f424d', color: '#fff', cursor: 'pointer' }}>Cancelar</button>
              <button disabled={isPending} onClick={handleSaveGroup} style={{ padding: '8px 16px', borderRadius: '6px', background: '#8b5cf6', border: 'none', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>
                {isPending ? 'Salvando...' : 'Salvar Grupo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#8b5cf6' }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}
