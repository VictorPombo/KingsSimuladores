'use client'

import React from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

// Mock Data for a robust appearance
const dataKings = [
  { name: '01 Abr', revenue: 12000 },
  { name: '02 Abr', revenue: 15500 },
  { name: '03 Abr', revenue: 10200 },
  { name: '04 Abr', revenue: 23000 },
  { name: '05 Abr', revenue: 18000 },
  { name: '06 Abr', revenue: 27500 },
  { name: '07 Abr', revenue: 31200 }
];

const dataMsu = [
  { name: '01 Abr', revenue: 4000 },
  { name: '02 Abr', revenue: 3500 },
  { name: '03 Abr', revenue: 5200 },
  { name: '04 Abr', revenue: 4800 },
  { name: '05 Abr', revenue: 8000 },
  { name: '06 Abr', revenue: 7500 },
  { name: '07 Abr', revenue: 11200 }
];

export function RevenueChart({ isMsu }: { isMsu: boolean }) {
  const data = isMsu ? dataMsu : dataKings
  const strokeColor = isMsu ? '#06b6d4' : '#10b981'
  const fillColor = isMsu ? 'rgba(6, 182, 212, 0.2)' : 'rgba(16, 185, 129, 0.2)'

  return (
    <div style={{ width: '100%', height: '350px', marginTop: '16px', background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#e2e8f0', marginBottom: '24px' }}>
        Projeção de GMV dos Últimos 7 Dias
      </h3>
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
    </div>
  )
}
