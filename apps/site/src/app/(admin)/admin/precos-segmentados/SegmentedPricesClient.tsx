'use client'

import React, { useState, useTransition } from 'react'
import { Plus, Edit2, Trash2, Tag, Percent, X, Search, Save, Package } from 'lucide-react'
import { createCustomerGroup, updateCustomerGroup, deleteCustomerGroup, setSegmentedPrice } from './actions'

type Group = { id: string; name: string; discount_percent: number }
type Product = { id: string; title: string; sku: string; price: number }
type PriceOverride = { id: string; product_id: string; group_id: string; price: number }

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
      if (editingGroup.id) {
        const res = await updateCustomerGroup(editingGroup.id, editingGroup.name!, discount)
        if (res.success && res.data) {
          setGroups(g => g.map(x => x.id === res.data.id ? res.data : x))
          if (activeGroup?.id === editingGroup.id) setActiveGroup(res.data)
        }
      } else {
        const res = await createCustomerGroup(editingGroup.name!, discount)
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

  const handlePriceSave = (productId: string) => {
    if (!activeGroup) return
    const rawVal = localPrices[productId]
    startTransition(async () => {
      const parsedVal = rawVal && rawVal.trim() !== '' ? parseFloat(rawVal) : null
      const res = await setSegmentedPrice(productId, activeGroup.id, parsedVal)
      
      if (res.success) {
        // Update local state overrides
        setOverrides(prev => {
          const filtered = prev.filter(o => !(o.product_id === productId && o.group_id === activeGroup.id))
          if (parsedVal !== null) {
            filtered.push({ id: `temp-${Date.now()}`, product_id: productId, group_id: activeGroup.id, price: parsedVal })
          }
          return filtered
        })
        const newLocal = { ...localPrices }
        delete newLocal[productId]
        setLocalPrices(newLocal)
      }
    })
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
      {/* Sidebar: Grupos */}
      <div style={{ flex: '1 1 300px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '1.2rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UsersIcon /> Grupos
          </h2>
          <button onClick={() => { setEditingGroup({ name: '', discount_percent: 0 }); setModalOpen(true) }}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10b981' }}>
                <Percent size={12} /> {g.discount_percent}% de desconto base
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Tabela de Preços */}
      <div style={{ flex: '3 1 500px', background: '#2c2e36', borderRadius: '12px', border: '1px solid #3f424d', padding: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {!activeGroup ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', opacity: 0.6 }}>
            <Tag size={48} style={{ marginBottom: '16px' }} />
            <p>Selecione ou crie um grupo à esquerda para configurar preços específicos.</p>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #3f424d' }}>
              <h2 style={{ fontSize: '1.4rem', color: '#fff', margin: '0 0 8px 0' }}>Tabela de Preços: {activeGroup.name}</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Produtos sem preço fixado usarão o desconto padrão do grupo ({activeGroup.discount_percent}%).
              </p>
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
                    <th style={{ padding: '12px', fontWeight: 600 }}>Preço Específico (Grupo)</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const override = overrides.find(o => o.product_id === p.id && o.group_id === activeGroup.id)
                    const isEditing = localPrices[p.id] !== undefined
                    const finalPrice = override ? override.price : (p.price * (1 - (activeGroup.discount_percent / 100)))

                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #3f424d20' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Package size={16} color="#8b5cf6" /> {p.title}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '2px', paddingLeft: '24px' }}>SKU: {p.sku || 'N/A'}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '4px 8px' }}>
                              <span style={{ color: '#64748b', fontSize: '0.85rem', marginRight: '4px' }}>R$</span>
                              <input 
                                type="number" 
                                placeholder={override ? String(override.price) : 'Auto calculado'}
                                value={localPrices[p.id] ?? (override?.price || '')}
                                onChange={e => setLocalPrices({ ...localPrices, [p.id]: e.target.value })}
                                style={{ width: '90px', background: 'transparent', border: 'none', color: override || isEditing ? '#10b981' : '#94a3b8', outline: 'none', fontSize: '0.9rem' }}
                              />
                            </div>
                            
                            {isEditing && (
                              <button onClick={() => handlePriceSave(p.id)} disabled={isPending}
                                style={{ padding: '6px', background: '#10b98120', border: '1px solid #10b981', borderRadius: '6px', color: '#10b981', cursor: 'pointer', display: 'flex' }}>
                                <Save size={14} />
                              </button>
                            )}

                            {!isEditing && !override && (
                              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                (-{activeGroup.discount_percent}%) = {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(finalPrice)}
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
          <div style={{ background: '#1e1e1e', borderRadius: '12px', width: '400px', border: '1px solid #3f424d', overflow: 'hidden' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #3f424d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{editingGroup?.id ? 'Editar Grupo' : 'Novo Grupo'}</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Nome do Grupo</label>
                <input 
                  type="text" 
                  value={editingGroup?.name || ''} 
                  onChange={e => setEditingGroup({ ...editingGroup, name: e.target.value })}
                  placeholder="Ex: Revendedores Ouro"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #3f424d', background: '#2c2e36', color: '#fff', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '8px' }}>Desconto Padrão (%)</label>
                <div style={{ display: 'flex', alignItems: 'center', background: '#2c2e36', border: '1px solid #3f424d', borderRadius: '6px', padding: '0 12px' }}>
                  <input 
                    type="number" 
                    value={editingGroup?.discount_percent || 0} 
                    onChange={e => setEditingGroup({ ...editingGroup, discount_percent: Number(e.target.value) })}
                    style={{ flex: 1, padding: '10px 0', background: 'transparent', border: 'none', color: '#10b981', outline: 'none', fontWeight: 600 }}
                  />
                  <Percent size={14} color="#64748b" />
                </div>
                <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '6px 0 0' }}>Aplicado a produtos sem preço específico fixado.</p>
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
