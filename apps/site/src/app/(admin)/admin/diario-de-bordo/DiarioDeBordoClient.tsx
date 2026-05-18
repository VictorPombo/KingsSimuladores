'use client'

import React, { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts'

type Props = {
  dataFaturamento: { name: string; Faturamento: number; Produtos: number; Envio: number }[]
  dataPedidos: { name: string; Aprovados: number; Cancelados: number }[]
  dataTicket: { name: string; Ticket: number }[]
  dataPiePagamento: { name: string; value: number }[]
  fat30: number
  fatMedioDia: number
  produtosAtivos: number
}

const COLORS = ['#22d3ee', '#fbbf24', '#06d6a0', '#8b5cf6', '#ff3b5c']

const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function EmptyChart({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px', color: '#64748b', fontSize: '0.85rem', flexDirection: 'column', gap: '8px' }}>
      <span style={{ fontSize: '2rem', opacity: 0.3 }}>📊</span>
      {message}
    </div>
  )
}

export function DiarioDeBordoClient({ dataFaturamento, dataPedidos, dataTicket, dataPiePagamento, fat30, fatMedioDia, produtosAtivos }: Props) {
  const [activeTab, setActiveTab] = useState<'vendas' | 'produtos'>('vendas')

  const hasRevenueData = dataFaturamento.some(d => d.Faturamento > 0)
  const hasOrderData = dataPedidos.some(d => d.Aprovados > 0 || d.Cancelados > 0)
  const hasTicketData = dataTicket.some(d => d.Ticket > 0)
  const hasPieData = dataPiePagamento.length > 0 && !dataPiePagamento.every(d => d.name === 'Sem dados')

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
                {hasRevenueData ? (
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
                        formatter={(val: any) => fmt(val || 0)}
                      />
                      <Legend iconType="square" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="Faturamento" fill="#06d6a0" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Nenhum faturamento registrado nos últimos 12 meses" />
                )}
              </div>
            </div>

            {/* CARD 2: BIG NUMBERS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e2e8f0', margin: 0, marginBottom: '20px' }}>Faturamento / últimos 30 dias</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#06d6a0', fontFamily: 'var(--font-display)' }}>
                  {fmt(fat30)}
                </div>
              </div>
              <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#e2e8f0', margin: 0, marginBottom: '20px' }}>Faturamento médio dia / últimos 30 dias</h3>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: '#06d6a0', fontFamily: 'var(--font-display)' }}>
                  {fmt(fatMedioDia)}
                </div>
              </div>
            </div>

            {/* CARD 3: Pedidos Aprovados vs Cancelados */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Qtd. Pedidos Aprovados x Cancelados</h3>
              </div>
              <div style={{ height: '300px' }}>
                {hasOrderData ? (
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
                ) : (
                  <EmptyChart message="Nenhum pedido registrado nos últimos 12 meses" />
                )}
              </div>
            </div>

            {/* CARD 4: Composição Faturamento */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Composição do faturamento / 12 meses</h3>
              </div>
              <div style={{ height: '300px' }}>
                {hasRevenueData ? (
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
                ) : (
                  <EmptyChart message="Sem dados de composição" />
                )}
              </div>
            </div>

            {/* CARD 5: Ticket Medio (LineChart) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Ticket médio / 12 meses</h3>
              </div>
              <div style={{ height: '300px' }}>
                {hasTicketData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dataTicket} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3d" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(val) => `R$ ${val}`} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} formatter={(val: any) => fmt(val || 0)} />
                      <Legend iconType="line" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="Ticket" stroke="#38bdf8" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart message="Sem dados de ticket médio" />
                )}
              </div>
            </div>

            {/* CARD 6: Pagamentos (Pie) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', margin: 0 }}>Formas de pagamento / 30 dias</h3>
              </div>
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {hasPieData ? (
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
                ) : (
                  <EmptyChart message="Sem dados de pagamento nos últimos 30 dias" />
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'produtos' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            {/* Produtos Ativos (Gauge) */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#e2e8f0', margin: 0, marginBottom: '40px' }}>Produtos ativos</h3>
              <div style={{ position: 'relative', width: '200px', height: '200px', borderRadius: '50%', border: '8px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="200" height="200" style={{ position: 'absolute', top: -8, left: -8, transform: 'rotate(-90deg)' }}>
                  <circle cx="100" cy="100" r="96" fill="transparent" stroke="#22d3ee" strokeWidth="8" strokeDasharray="603" strokeDashoffset={603 - (603 * Math.min(produtosAtivos, 200) / 200)} strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: '#22d3ee' }}>{produtosAtivos}</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ background: '#181a20', border: '1px solid #2a2d3d', borderRadius: '8px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.8, maxWidth: '500px' }}>
                <p style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>📦 Inventário em Tempo Real</p>
                <p>O número de produtos ativos é calculado automaticamente a partir do banco de dados.</p>
                <p>Para visualizar os produtos mais vendidos, acesse a aba <strong style={{ color: '#22d3ee' }}>Pedidos</strong> e filtre por período.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
