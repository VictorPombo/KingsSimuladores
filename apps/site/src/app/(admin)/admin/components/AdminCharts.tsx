'use client'

import React, { useEffect, useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { createClient } from '@kings/db/client'

type DayRevenue = { name: string; revenue: number }

export function RevenueChart({ currentStore }: { currentStore: string }) {
  const [data, setData] = useState<DayRevenue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRevenue() {
      try {
        const supabase = createClient()
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
        const isoStart = sevenDaysAgo.toISOString()

        let query
        if (currentStore === 'msu') {
          query = supabase
            .from('marketplace_orders')
            .select('total_price, created_at')
            .gte('created_at', isoStart)
        } else {
          query = supabase
            .from('orders')
            .select('total, created_at')
            .eq('status', 'paid')
            .gte('created_at', isoStart)
            
          if (currentStore === 'kings' || currentStore === 'seven') {
            query = query.eq('brand_origin', currentStore)
          }
        }

        const { data: rows, error } = await query.abortSignal(controller.signal)
        clearTimeout(timeoutId)
        if (error) throw error

        // Group by day
        const byDay: Record<string, number> = {}
        for (let i = 0; i < 7; i++) {
          const d = new Date()
          d.setDate(d.getDate() - (6 - i))
          const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
          byDay[key] = 0
        }

        ;(rows || []).forEach((row: any) => {
          const d = new Date(row.created_at)
          const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
          const value = currentStore === 'msu' ? (row.total_price || 0) : (row.total || 0)
          if (byDay[key] !== undefined) {
            byDay[key] += Number(value)
          }
        })

        const chartData = Object.entries(byDay).map(([name, revenue]) => ({ name, revenue }))
        setData(chartData)
      } catch (err) {
        console.error('RevenueChart error:', err)
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchRevenue()
  }, [currentStore])

  const strokeColor = currentStore === 'msu' ? '#06b6d4' : currentStore === 'seven' ? '#facc15' : '#10b981'

  return (
    <div style={{ width: '100%', height: '350px', marginTop: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '24px' }}>
        {currentStore === 'msu' ? 'GMV Transacionado' : 'Faturamento'} — Últimos 7 Dias
      </h3>
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#64748b', fontSize: '0.85rem' }}>
          Carregando dados reais...
        </div>
      ) : data.every(d => d.revenue === 0) ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80%', color: '#64748b', fontSize: '0.85rem', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '2rem', opacity: 0.3 }}>📊</span>
          Nenhuma venda nos últimos 7 dias
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="85%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.4}/>
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `R$${(value / 1000).toFixed(1)}k`}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
              itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              formatter={(value: any) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0), 'Faturamento']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke={strokeColor} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
