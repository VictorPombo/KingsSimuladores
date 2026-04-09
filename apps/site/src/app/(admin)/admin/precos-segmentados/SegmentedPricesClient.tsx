'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Tag, Percent, X, Search, Save, Package, Globe, MousePointerClick, Image as ImageIcon } from 'lucide-react'
import { createCustomerGroup, updateCustomerGroup, deleteCustomerGroup, setSegmentedProductRule } from './actions'

type Group = { id: string; name: string; discount_percent: number; apply_to_all_products: boolean }
type Product = { id: string; title: string; sku: string; price: number; images?: string[] }
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
    if (newRule === 'fixed') {
      const existing = overrides.find(o => o.product_id === productId && o.group_id === activeGroup.id)
      setLocalPrices({ ...localPrices, [productId]: existing?.price ? String(existing.price) : '' })
      return
    }

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
    <div className="segmented-container">
      <style dangerouslySetInnerHTML={{__html: `
        .segmented-container { display: flex; gap: 24px; flex-wrap: wrap; }
        .sidebar { flex: 1 1 300px; max-width: 400px; }
        .main-content { flex: 3 1 500px; background: #2c2e36; border-radius: 12px; border: 1px solid #3f424d; padding: 24px; display: flex; flex-direction: column; }
        
        .product-list { display: flex; flex-direction: column; gap: 8px; }
        .product-row { 
          display: flex; align-items: center; justify-content: space-between; 
          padding: 12px; background: #24252b; border: 1px solid #3f424d80; border-radius: 8px;
          transition: border 0.2s; gap: 12px;
        }
        .product-row:hover { border-color: #3f424d; background: #292a31; }
        
        .prod-info { display: flex; align-items: center; gap: 12px; flex: 2; min-width: 150px; overflow: hidden; }
        .prod-img { width: 44px; height: 44px; border-radius: 6px; background: #18191d; border: 1px solid #3f424d; display: flex; align-items: center; justify-content: center; flex-shrink: 0; overflow: hidden; }
        .prod-img img { width: 100%; height: 100%; object-fit: cover; }
        .prod-details { display: flex; flex-direction: column; gap: 2px; overflow: hidden; }
        .prod-title { color: #f8fafc; font-size: 0.9rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .prod-sku { color: #64748b; font-size: 0.75rem; }
        
        .prod-price-orig { flex: 0.8; color: #94a3b8; font-size: 0.85rem; }
        
        .prod-rule { flex: 1.2; min-width: 140px; }
        .prod-rule select { 
          width: 100%; background: #1f2025; color: #f8fafc; padding: 8px 10px; border-radius: 6px; 
          font-size: 0.8rem; outline: none; cursor: pointer; border: 1px solid #3f424d;
        }
        
        .prod-final { flex: 1; display: flex; justify-content: flex-end; align-items: center; min-width: 110px; }
        
        @media (max-width: 900px) {
          .product-row { flex-direction: column; align-items: flex-start; gap: 10px; }
          .prod-info { width: 100%; }
          .prod-price-orig { width: 100%; font-size: 0.8rem; display: flex; gap: 8px; }
          .prod-price-orig::before { content: "Original:"; color: #64748b; }
          .prod-rule { width: 100%; }
          .prod-final { width: 100%; justify-content: flex-start; margin-top: 4px; padding-top: 10px; border-top: 1px dashed #3f424d80; }
        }
      `}} />

      {/* Sidebar: Grupos */}
      <div className="sidebar">
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
      <div className="main-content">
        {!activeGroup ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            <Tag size={48} style={{ marginBottom: '24px', opacity: 0.5 }} />
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '12px' }}>Como funcionam as Tabelas de Preço?</h3>
            <div style={{ maxWidth: '500px', fontSize: '0.9rem', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <p>Crie regras dinâmicas para grupos:</p>
              
              <div style={{ background: '#1e293b', borderLeft: '3px solid #64748b', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>1. Preço Normal (Inativo)</strong>
                O desconto do grupo é ignorado e o produto mantém preço original.
              </div>

              <div style={{ background: '#1e293b', borderLeft: '3px solid #8b5cf6', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>2. Desconto Base</strong>
                O produto recebe a porcentagem da capa do grupo de forma automática.
              </div>
              
              <div style={{ background: '#1e293b', borderLeft: '3px solid #10b981', padding: '16px', borderRadius: '0 8px 8px 0' }}>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '4px' }}>3. Preço Fixo</strong>
                Você digita um valor gravado na pedra apenas para este grupo e produto.
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #3f424d', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px 0' }}>Gerenciar: {activeGroup.name}</h2>
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', background: '#1f2025', borderRadius: '8px', padding: '10px 16px', marginBottom: '20px', border: '1px solid #3f424d' }}>
              <Search size={18} color="#64748b" />
              <input 
                type="text" 
                placeholder="Buscar produto por nome ou SKU..." 
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', outline: 'none', marginLeft: '12px', fontSize: '0.9rem' }} 
              />
            </div>

            {/* Nova Lista de Produtos Responsiva */}
            <div className="product-list">
              {filteredProducts.map(p => {
                const override = overrides.find(o => o.product_id === p.id && o.group_id === activeGroup.id)
                const isManualEditing = localPrices[p.id] !== undefined
                
                let currentRule: 'normal' | 'base_discount' | 'fixed' = activeGroup.apply_to_all_products ? 'base_discount' : 'normal'
                if (override) {
                  if (override.status === 'ignored') currentRule = 'normal'
                  else if (override.price !== null) currentRule = 'fixed'
                  else currentRule = 'base_discount'
                }
                if (isManualEditing) currentRule = 'fixed'

                let finalPrice = p.price
                if (currentRule === 'base_discount') finalPrice = p.price * (1 - (activeGroup.discount_percent / 100))
                else if (currentRule === 'fixed' && !isManualEditing && override?.price) finalPrice = override.price

                return (
                  <div key={p.id} className="product-row">
                    
                    {/* Imagem + Titulo */}
                    <div className="prod-info">
                      <div className="prod-img">
                        {p.images && p.images[0] ? (
                          <img src={p.images[0]} alt={p.title} />
                        ) : (
                          <ImageIcon size={20} color="#3f424d" />
                        )}
                      </div>
                      <div className="prod-details">
                        <div className="prod-title" title={p.title}>{p.title}</div>
                        <div className="prod-sku">SKU: {p.sku || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Preço Original */}
                    <div className="prod-price-orig">
                      {fmt(p.price)}
                    </div>
                    
                    {/* Regra Select */}
                    <div className="prod-rule">
                      <select 
                        disabled={isPending}
                        value={currentRule}
                        onChange={(e) => handleProductRuleChange(p.id, e.target.value as any)}
                        style={{ borderColor: currentRule === 'normal' ? '#3f424d' : currentRule === 'base_discount' ? '#8b5cf6' : '#10b981' }}
                      >
                        <option value="normal">Normal (Sem desc.)</option>
                        <option value="base_discount">- {activeGroup.discount_percent}% (Base)</option>
                        <option value="fixed">Fixo Específico</option>
                      </select>
                    </div>

                    {/* Preço Final Display ou Input */}
                    <div className="prod-final">
                      {currentRule === 'fixed' ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', background: '#1f2025', border: '1px solid #10b981', borderRadius: '6px', padding: '4px 8px', maxWidth: '100px' }}>
                            <span style={{ color: '#10b981', fontSize: '0.8rem', marginRight: '4px' }}>R$</span>
                            <input 
                              type="number" 
                              placeholder="0.00"
                              value={localPrices[p.id] ?? (override?.price || '')}
                              onChange={e => setLocalPrices({ ...localPrices, [p.id]: e.target.value })}
                              style={{ width: '100%', background: 'transparent', border: 'none', color: '#10b981', outline: 'none', fontSize: '0.9rem', fontWeight: 'bold' }}
                            />
                          </div>
                          {isManualEditing && (
                            <button onClick={() => handleFixedPriceSave(p.id)} disabled={isPending}
                              style={{ padding: '6px', background: '#10b98120', border: '1px solid #10b981', borderRadius: '6px', color: '#10b981', cursor: 'pointer', display: 'flex' }}>
                              <Save size={14} />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.9rem', fontWeight: currentRule === 'base_discount' ? 600 : 400, color: currentRule === 'base_discount' ? '#8b5cf6' : '#94a3b8' }}>
                          {fmt(finalPrice)}
                        </span>
                      )}
                    </div>

                  </div>
                )
              })}
            </div>

          </>
        )}
      </div>

      {/* Modal Grupo (Mantido igual) */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#1e1e1e', borderRadius: '12px', width: '450px', maxWidth: '90%', border: '1px solid #3f424d', overflow: 'hidden' }}>
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
