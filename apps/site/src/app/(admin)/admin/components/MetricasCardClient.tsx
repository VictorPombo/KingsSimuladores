'use client'

import { formatPrice } from '@kings/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Users, ShoppingBag, TrendingUp, DollarSign, Calendar, Eye, MoveRight, Filter } from 'lucide-react'

function formatCompact(number: number) {
  if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'k'
  }
  return number.toString()
}

export function MetricasCardClient({ data }: { data: any }) {
  // Configuração para o Recharts
  const chartData = data.visits.chartData.map((d: any) => {
    const date = new Date(d.dia)
    date.setUTCHours(12) // evitar shift timezone
    const label = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    return {
      name: label,
      Visitas: Number(d.unique_visits)
    }
  })

  // Formatadores customizados
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#1a2235', border: '1px solid #334155', padding: '12px', borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.5)' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '4px', margin: 0 }}>{label}</p>
          <p style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'var(--font-mono)', margin: 0 }}>
            {payload[0].value} <span style={{ color: '#64748b', fontFamily: 'var(--font-sans)', fontWeight: 400, fontSize: '0.75rem' }}>acessos</span>
          </p>
        </div>
      )
    }
    return null
  }

  const containerStyle = {
    background: '#1c2434', // Cor base do mockup
    borderRadius: '16px',
    padding: '32px',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    marginBottom: '40px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  }

  return (
    <div style={containerStyle}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '48px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: '#f8fafc' }}>Métricas do Site</h2>
        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Últimos 30 dias</span>
      </div>

      {/* 1. KPIs Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '64px' }}>
        
        {/* KPI 1: Usuários Cadastrados */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, transform: 'scale(2) translate(-10%, 10%)' }}>
            <Users size={80} color="#3b82f6" strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <Users size={20} />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.2, fontWeight: 500 }}>Usuários<br/>Cadastrados</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', lineHeight: 1 }}>
            {data.customers.toLocaleString('pt-BR')}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
            Ativos na plataforma
          </div>
        </div>

        {/* KPI 2: Vendas Realizadas */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, transform: 'scale(2) translate(-10%, 10%)' }}>
            <ShoppingBag size={80} color="#10b981" strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <ShoppingBag size={20} />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.2, fontWeight: 500 }}>Vendas<br/>Realizadas</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', lineHeight: 1 }}>
            {data.orders.toLocaleString('pt-BR')}
          </div>
          <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 600 }}>
            + {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 1 }).format(data.revenue).replace(',0', 'k').replace(',1', '.1k').replace(',2', '.2k').replace(',3', '.3k').replace(',4', '.4k').replace(',5', '.5k').replace(',6', '.6k').replace(',7', '.7k').replace(',8', '.8k').replace(',9', '.9k')} transacionados
          </div>
        </div>

        {/* KPI 3: Visitas Hoje */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, transform: 'scale(2) translate(-10%, 10%)' }}>
            <TrendingUp size={80} color="#10b981" strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <TrendingUp size={20} />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 500 }}>Visitas Hoje</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', lineHeight: 1 }}>
            {data.visits.today.toLocaleString('pt-BR')}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
            Acessos únicos<br/>detectados
          </div>
        </div>

        {/* KPI 4: Valor em Estoque */}
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, right: 0, opacity: 0.05, transform: 'scale(2) translate(-10%, 10%)' }}>
            <DollarSign size={80} color="#eab308" strokeWidth={1.5} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
            <div style={{ color: '#eab308', background: 'rgba(234, 179, 8, 0.1)', padding: '8px', borderRadius: '8px' }}>
              <DollarSign size={20} />
            </div>
            <div style={{ color: '#cbd5e1', fontSize: '0.9rem', lineHeight: 1.2, fontWeight: 500 }}>Valor em<br/>Estoque</div>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', marginBottom: '8px', lineHeight: 1 }}>
            R$ {formatCompact(data.stockValue)}
          </div>
          <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 500 }}>
            Total em anúncios ativos
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '64px' }}>
        
        {/* 2. Gráfico de Visitas (Área Vermelha) */}
        <div>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Calendar color="#f8fafc" size={20} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Histórico de Acessos (30 Dias)</h3>
          </div>
          <div style={{ height: '350px', width: '100%' }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={{ stroke: '#334155' }} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dy={10}
                    interval="preserveStartEnd"
                    minTickGap={30}
                  />
                  <YAxis 
                    axisLine={{ stroke: '#334155' }} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Visitas"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  >
                    {chartData.map((_: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === chartData.length - 1 ? '#ef4444' : 'rgba(239,68,68,0.45)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Aguardando primeiros dados de tráfego...
              </div>
            )}
          </div>
        </div>

        {/* 3. Top 5 Mais Vistos */}
        <div>
          <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Eye color="#f8fafc" size={20} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Top 5 Mais Vistos</h3>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {data.topProducts.length > 0 ? data.topProducts.map((prod: any, idx: number) => (
              <div key={prod.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '16px', color: '#cbd5e1', fontWeight: 500, fontSize: '1rem' }}>{idx + 1}</div>
                <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#fff', overflow: 'hidden', flexShrink: 0 }}>
                  {prod.thumbnail && <img src={prod.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '1rem', color: '#f8fafc', fontWeight: 600, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.title}</p>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>{formatPrice(prod.price)}</p>
                </div>
                <div style={{ textAlign: 'right', color: '#ef4444', fontWeight: 800, fontSize: '1.1rem' }}>
                  {prod.views || 0}
                </div>
              </div>
            )) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.85rem' }}>
                Nenhuma visualização.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Funil de Conversão (Novo) */}
      <div style={{ marginTop: '64px', borderTop: '1px solid #334155', paddingTop: '48px' }}>
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Filter color="#f8fafc" size={20} />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Funil de Conversão (30 Dias)</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '4px 0 0 0' }}>Jornada de compras e retenção de tráfego</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Topo: Visitantes */}
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(59, 130, 246, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Visitantes Totais</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{data.funnel?.visits || 0}</div>
          </div>
          
          <div style={{ color: '#475569', display: 'flex', justifyContent: 'center' }}>
            <MoveRight size={24} />
          </div>

          {/* Meio: Carrinhos Criados (Abandonados + Finalizados) */}
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(234, 179, 8, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(234, 179, 8, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#facc15', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Carrinhos Criados</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{(data.funnel?.abandonedCarts || 0) + (data.funnel?.completed || 0)}</div>
            <div style={{ fontSize: '0.8rem', color: '#eab308', marginTop: '12px', fontWeight: 500, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>• {data.funnel?.abandonedCarts || 0} abandonados</div>
              <div style={{ opacity: 0.8 }}>Taxa de abandono: {Math.round(((data.funnel?.abandonedCarts || 0) / ((data.funnel?.abandonedCarts || 0) + (data.funnel?.completed || 0) || 1)) * 100)}%</div>
            </div>
          </div>

          <div style={{ color: '#475569', display: 'flex', justifyContent: 'center' }}>
            <MoveRight size={24} />
          </div>

          {/* Fundo: Compras Finalizadas */}
          <div style={{ flex: 1, minWidth: '200px', background: 'rgba(16, 185, 129, 0.05)', padding: '24px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: 600, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Compras Finalizadas</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>{data.funnel?.completed || 0}</div>
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '12px', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', display: 'inline-block', padding: '4px 8px', borderRadius: '4px' }}>
              Taxa de Conversão: {((data.funnel?.completed || 0) / (data.funnel?.visits || 1) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
