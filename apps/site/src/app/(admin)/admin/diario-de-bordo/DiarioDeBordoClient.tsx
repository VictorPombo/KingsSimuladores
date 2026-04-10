'use client'

import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

// ===== MOCK DATA =====
const dataFaturamento = [
  { name: 'MAI', Faturamento: 520000, Produtos: 300000, Envio: 20000 },
  { name: 'JUN', Faturamento: 480000, Produtos: 280000, Envio: 18000 },
  { name: 'JUL', Faturamento: 200000, Produtos: 150000, Envio: 10000 },
  { name: 'AGO', Faturamento: 350000, Produtos: 200000, Envio: 15000 },
  { name: 'SET', Faturamento: 480000, Produtos: 300000, Envio: 18000 },
  { name: 'OUT', Faturamento: 340000, Produtos: 200000, Envio: 14000 },
  { name: 'NOV', Faturamento: 300000, Produtos: 180000, Envio: 12000 },
  { name: 'DEZ', Faturamento: 70000, Produtos: 40000, Envio: 5000 },
  { name: 'JAN', Faturamento: 25000, Produtos: 15000, Envio: 2000 },
  { name: 'FEV', Faturamento: 80000, Produtos: 50000, Envio: 6000 },
  { name: 'MAR', Faturamento: 110000, Produtos: 70000, Envio: 8000 },
  { name: 'ABR', Faturamento: 98022, Produtos: 60000, Envio: 7500 },
]

const dataPedidos = dataFaturamento.map(d => ({
  name: d.name,
  Aprovados: Math.floor(d.Faturamento / 3630), // mock based on ticket medio
  Cancelados: Math.floor((d.Faturamento / 3630) * 0.3)
}))

const dataTicket = dataFaturamento.map(d => ({
  name: d.name,
  Ticket: 3000 + Math.random() * 2000
}))

const dataPiePagamento = [
  { name: 'Pix', value: 45 },
  { name: 'Mercado Pago', value: 40 },
  { name: 'Pagamento Externo', value: 14 }
]

const dataPieEnvio = [
  { name: 'Enviali', value: 41 },
  { name: 'Melhor Envio', value: 44 },
  { name: 'Envio Externo', value: 11 },
  { name: 'Retirar pessoalmente', value: 4 }
]

const COLORS = ['#22d3ee', '#fbbf24', '#06d6a0', '#8b5cf6', '#ff3b5c']

export function DiarioDeBordoClient() {
  const [activeTab, setActiveTab] = useState<'vendas' | 'produtos'>('vendas')

  return (
    <div style={{ marginTop: '20px' }}>
      {/* TABS */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('vendas')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'vendas' ? '#fff' : '#2c2e36',
            color: activeTab === 'vendas' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
          }}
        >
          Vendas
        </button>
        <button
          onClick={() => setActiveTab('produtos')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'produtos' ? '#fff' : '#2c2e36',
            color: activeTab === 'produtos' ? '#000' : '#fff',
            border: 'none',
            borderRadius: '6px 6px 0 0',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
          }}
        >
          Produtos
        </button>
      </div>

      <div style={{ background: '#22252e', padding: '24px', borderRadius: '0 8px 8px 8px', minHeight: '800px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        
        {activeTab === 'vendas' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* CARD 1: Faturamento 12 Meses */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Faturamento / 12 meses</h3>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataFaturamento} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickFormatter={(val) => `R$ ${(val/1000)}k`} 
                      axisLine={false} 
                      tickLine={false}
                    />
                    <Tooltip 
                      cursor={{ fill: '#2a2d3d' }}
                      contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)}
                    />
                    <Legend iconType="square" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Faturamento" fill="#06d6a0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARD 2: BIG NUMBERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e2e8f0', margin: 0, marginBottom: '20px' }}>Faturamento / últimos 30 dias</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#06d6a0', fontFamily: 'var(--font-display)' }}>
                  R$ 98.022,67
                </div>
              </div>
              <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e2e8f0', margin: 0, marginBottom: '20px' }}>Faturamento médio dia / últimos 30 dias</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#06d6a0', fontFamily: 'var(--font-display)' }}>
                  R$ 3.267,42
                </div>
              </div>
            </div>

            {/* CARD 3: Pedidos Aprovados vs Cancelados */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Qtd. Pedidos Aprovados x Cancelados</h3>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataPedidos} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#2a2d3d' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Aprovados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Cancelados" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARD 4: Composição Faturamento */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Composição do faturamento / 12 meses</h3>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataFaturamento} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `R$ ${(val/1000)}k`} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: '#2a2d3d' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                    <Legend iconType="square" wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="Produtos" stackId="a" fill="#10b981" />
                    <Bar dataKey="Envio" stackId="a" fill="#34d399" />
                    <Bar dataKey="Faturamento" stackId="a" fill="#6ee7b7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARD 5: Ticket Medio (LineChart) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Ticket médio / 12 meses</h3>
              </div>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataTicket} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(val: any) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)} />
                    <Legend iconType="line" wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="Ticket" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARD 6: Pagamentos (Pie) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Formas de pagamento / 30 dias</h3>
              </div>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPiePagamento}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {dataPiePagamento.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* CARD 7: Envios (Pie) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Formas de envio / 30 dias</h3>
              </div>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataPieEnvio}
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {dataPieEnvio.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'produtos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            {/* Produtos Ativos (Gauge mock) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0', margin: 0, marginBottom: '40px' }}>Produtos ativos</h3>
              <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', border: '8px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="200" height="200" style={{ position: 'absolute', top: -8, left: -8, transform: 'rotate(-90deg)' }}>
                  <circle cx="100" cy="100" r="96" fill="transparent" stroke="#22d3ee" strokeWidth="8" strokeDasharray="603" strokeDashoffset="200" strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#22d3ee' }}>89</span>
              </div>
            </div>

            {/* Produtos mais vendidos Table */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Produtos mais vendidos / últimos 30 dias</h3>
              </div>
              <div className="admin-overflow-table">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#22252e', color: '#94a3b8' }}>
                      <th style={{ padding: '12px', fontWeight: 600 }}>Código</th>
                      <th style={{ padding: '12px', fontWeight: 600 }}>Produto</th>
                      <th style={{ padding: '12px', fontWeight: 600 }}>Qtd. Vendida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { code: 'R5_KIT', prod: 'Kit Direct Drive Para Pc Moza Racing R5 (5.5nm)', qtd: 4 },
                      { code: 'R3xbox', prod: 'Kit Direct drive 3,9nm R3 - XBOX/PC', qtd: 4 },
                      { code: 'ESX_WHEEL_XBOX', prod: 'Volante MOZA Racing ESX (XBOX)', qtd: 2 },
                      { code: 'R9_V3', prod: 'Base direct drive 9nm Moza Racing v3 R9', qtd: 2 },
                      { code: 'GS_V2_WHEEL', prod: 'VOLANTE MOZA RACING GS v2', qtd: 2 },
                      { code: 'RM_DASH', prod: 'Dashboard RM-Dash para bases R16 e R21', qtd: 2 },
                    ].map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #2a2d3d' }}>
                        <td style={{ padding: '12px', color: '#94a3b8' }}>{row.code}</td>
                        <td style={{ padding: '12px', color: '#e2e8f0' }}>{row.prod}</td>
                        <td style={{ padding: '12px', color: '#06d6a0', fontWeight: 700 }}>{row.qtd}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
