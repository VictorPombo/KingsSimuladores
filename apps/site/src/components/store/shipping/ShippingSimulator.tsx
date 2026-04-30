'use client'

import React, { useState } from 'react'
import { Button } from '@kings/ui'
import { formatPrice } from '@kings/utils'

interface Dimensions {
  weight: number
  width: number
  height: number
  length: number
}

interface ShippingSimulatorProps {
  dimensions: Dimensions[]
}

export function ShippingSimulator({ dimensions }: ShippingSimulatorProps) {
  const [cep, setCep] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [options, setOptions] = useState<any[]>([])
  const [errorMSG, setErrorMSG] = useState('')

  const handleCalculate = async () => {
    if (cep.replace(/\D/g, '').length !== 8) {
      setErrorMSG('Digite um CEP válido')
      return
    }

    setIsLoading(true)
    setErrorMSG('')
    setOptions([])

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toPostalCode: cep,
          dimensions
        })
      })
      const data = await res.json()
      
      if (data.options && data.options.length > 0) {
        setOptions(data.options)
      } else {
        setErrorMSG('Não foi possível cotar fretes para este CEP.')
      }
    } catch (err) {
      setErrorMSG('Erro na comunicação com servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div className="shipping-input-group">
        <input 
          type="text" 
          placeholder="Seu CEP" 
          value={cep}
          onChange={e => setCep(e.target.value)}
          maxLength={9}
          style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', outline: 'none' }}
        />
        <Button variant="secondary" onClick={handleCalculate} disabled={isLoading}>
          {isLoading ? 'Calculando...' : 'Calcular Frete'}
        </Button>
      </div>
      
      {errorMSG && <div style={{ color: 'var(--danger)', fontSize: '0.85rem', marginTop: '8px' }}>{errorMSG}</div>}
      
      {options.length > 0 && (
        <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600, textTransform: 'uppercase' }}>Estimativas de Entrega</div>
          {options.map(opt => (
            <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: '#fff' }}>{opt.company} {opt.name}</strong>
                <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>Até {opt.custom_delivery_time} dias úteis</span>
              </div>
              <div style={{ color: 'var(--accent)', fontWeight: 600 }}>
                {formatPrice(parseFloat(opt.price))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
