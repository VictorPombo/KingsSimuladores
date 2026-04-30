'use client'

import React, { useState, useTransition } from 'react'
import { Button } from '@kings/ui'
import { User, Smartphone, ShieldCheck, Home, Plus } from 'lucide-react'
import { updateProfile, updatePassword, addAddress, removeAddress } from './actions'

const InputField = ({ label, name, placeholder, type = "text", defaultValue = "", disabled = false }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{label}</label>
    <input 
      name={name}
      type={type} 
      placeholder={placeholder} 
      defaultValue={defaultValue}
      disabled={disabled}
      style={{
        background: disabled ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '0.75rem',
        padding: '12px 16px',
        color: disabled ? '#64748b' : '#fff',
        outline: 'none',
        fontSize: '0.95rem',
        transition: 'border 0.2s',
        cursor: disabled ? 'not-allowed' : 'text'
      }} 
      className="focus:border-[#00e5ff]"
    />
  </div>
)

export function ProfileForm({ profile, userEmail }: { profile: any, userEmail: string }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const handleAction = async (formData: FormData) => {
    setMessage('')
    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.error) setMessage('❌ ' + res.error)
      else setMessage('✅ Dados salvos com sucesso!')
      
      setTimeout(() => setMessage(''), 3000)
    })
  }

  return (
    <form action={handleAction} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User size={20} color="#00e5ff" /> Dados Pessoais
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <InputField label="Nome Completo" name="full_name" defaultValue={profile?.full_name || ''} />
          <InputField label="CPF/CNPJ" name="cpf_cnpj" defaultValue={profile?.cpf_cnpj || ''} placeholder="000.000.000-00" />
        </div>
      </div>

      <hr style={{ border: 0, height: '1px', background: 'rgba(255,255,255,0.08)' }} />

      <div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={20} color="#00e5ff" /> Dados de Contato
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          <InputField label="E-mail de Cadastro" defaultValue={userEmail} disabled={true} />
          <InputField label="Telefone / WhatsApp" name="phone" defaultValue={profile?.phone || ''} placeholder="(11) 99999-9999" />
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
        <span style={{ color: message.includes('❌') ? '#f87171' : '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
        <Button disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar Alterações'}</Button>
      </div>
    </form>
  )
}

export function SecurityForm() {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState('')

  const handleAction = async (formData: FormData) => {
    setMessage('')
    startTransition(async () => {
      const res = await updatePassword(formData)
      if (res?.error) setMessage('❌ ' + res.error)
      else setMessage('✅ Senha alterada com sucesso!')
      
      setTimeout(() => setMessage(''), 3000)
    })
  }

  return (
    <form action={handleAction} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ShieldCheck size={20} color="#f59e0b" /> Alterar Senha
      </h3>
      <div style={{ fontSize: '0.9rem', color: '#94a3b8', marginBottom: '-0.5rem' }}>Digite sua nova senha de acesso.</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <InputField label="Nova Senha" name="new_password" type="password" placeholder="••••••••" />
        <InputField label="Confirmar Nova Senha" name="confirm_password" type="password" placeholder="••••••••" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: message.includes('❌') ? '#f87171' : '#10b981', fontSize: '0.9rem', fontWeight: 600 }}>{message}</span>
        <Button variant="secondary" disabled={isPending}>{isPending ? 'Atualizando...' : 'Atualizar Senha'}</Button>
      </div>
    </form>
  )
}

export function AddressManager({ initialAddresses }: { initialAddresses: any[] }) {
  const [isAdding, setIsAdding] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleAddSubmit = async (formData: FormData) => {
    const addressData = {
      street: formData.get('street'),
      number: formData.get('number'),
      complement: formData.get('complement'),
      neighborhood: formData.get('neighborhood'),
      city: formData.get('city'),
      state: formData.get('state'),
      zip_code: formData.get('zip_code'),
      title: formData.get('title'),
      is_default: formData.get('is_default') === 'on'
    }

    startTransition(async () => {
      await addAddress(addressData)
      setIsAdding(false)
    })
  }

  const handleRemove = (id: string) => {
    if (confirm('Tem certeza que deseja remover este endereço?')) {
      startTransition(async () => {
        await removeAddress(id)
      })
    }
  }

  const addresses = Array.isArray(initialAddresses) ? initialAddresses : []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="card-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>Endereços Salvos</h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '4px 0 0 0' }}>Gerencie onde deseja receber seus produtos.</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} variant="secondary" style={{ display: 'flex', gap: '8px' }}>
              <Plus size={16} /> Novo Endereço
            </Button>
          )}
      </div>

      {isAdding && (
        <form action={handleAddSubmit} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '1.5rem', border: '1px solid #00e5ff' }}>
          <h4 style={{ margin: 0, color: '#fff' }}>Adicionar Novo Endereço</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <InputField label="Apelido do Local (Ex: Casa)" name="title" />
            <InputField label="CEP" name="zip_code" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '1rem' }}>
            <InputField label="Rua" name="street" />
            <InputField label="Número" name="number" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <InputField label="Complemento" name="complement" />
            <InputField label="Bairro" name="neighborhood" />
            <InputField label="Cidade / UF" name="city" placeholder="São Paulo / SP" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
            <input type="checkbox" name="is_default" defaultChecked /> Definir como principal
          </label>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'transparent', color: '#f87171', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancelar</button>
            <Button disabled={isPending}>{isPending ? 'Salvando...' : 'Salvar Endereço'}</Button>
          </div>
        </form>
      )}

      {addresses.length === 0 && !isAdding && (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
          Nenhum endereço cadastrado ainda.
        </div>
      )}

      {addresses.map((addr: any) => (
        <div key={addr.id} className="card-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ background: 'rgba(10, 14, 26, 0.5)', padding: '12px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', height: 'fit-content' }}>
                <Home size={20} color={addr.is_default ? "#10b981" : "#64748b"} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', margin: 0 }}>{addr.title || 'Endereço'}</h4>
                  {addr.is_default && (
                    <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 700 }}>PADRÃO</span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: '8px 0 4px 0', lineHeight: 1.5 }}>
                  {addr.street}, {addr.number} {addr.complement && `- ${addr.complement}`}<br/>
                  {addr.neighborhood}, {addr.city}<br/>
                  CEP {addr.zip_code}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button disabled={isPending} onClick={() => handleRemove(addr.id)} style={{ background: 'transparent', border: 'none', color: '#f87171', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', opacity: isPending ? 0.5 : 1 }}>Excluir</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
