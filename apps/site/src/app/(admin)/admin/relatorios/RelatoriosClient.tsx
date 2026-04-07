'use client'

import React, { useState, useTransition } from 'react'
import { Search, Filter, HelpCircle, Users, DollarSign, Package, Box, Download, ArrowLeft, Loader2, FileSpreadsheet } from 'lucide-react'
import {
  getClientesComPedidos,
  getClientesSemPedidos,
  getExportarClientes,
  getPedidosAprovadosReprovados,
  getTarifasTransacoes,
  getRelatorioPedidos,
  getPedidosComCupom,
  getResumoVendas,
  getPedidosEnvioDesabilitado,
  getExportarProdutos,
  getListaURLsProdutos,
  getProdutosComEstoque,
  getProdutosAguardandoEstoque,
  getVendasPorProduto,
  getVendasProdutosPorMes,
  getPedidosProdutosDetalhados,
} from './actions'

// ─── Definição dos relatórios ───
const REPORTS_LIST = [
  { id: 'clientes_com_pedidos', name: 'Clientes com pedidos', category: 'Clientes', icon: Users, action: getClientesComPedidos },
  { id: 'clientes_sem_pedidos', name: 'Clientes sem pedidos', category: 'Clientes', icon: Users, action: getClientesSemPedidos },
  { id: 'pedidos_aprovados_reprovados', name: 'Quantidade de pedidos aprovados/reprovados por cliente', category: 'Clientes', icon: Users, action: getPedidosAprovadosReprovados },
  { id: 'exportar_clientes', name: 'Exportar todos os clientes', category: 'Clientes', icon: Users, action: getExportarClientes },
  { id: 'tarifas_transacoes', name: 'Tarifas sobre transações', category: 'Financeiro', icon: DollarSign, info: true, action: getTarifasTransacoes },
  { id: 'relatorio_pedidos', name: 'Relatório de pedidos', category: 'Pedidos', icon: Package, info: true, action: getRelatorioPedidos },
  { id: 'pedidos_cupom', name: 'Pedidos com cupom', category: 'Pedidos', icon: Package, action: getPedidosComCupom },
  { id: 'pedidos_envio_desabilitado', name: 'Pedidos com envio desabilitado', category: 'Pedidos', icon: Package, action: getPedidosEnvioDesabilitado },
  { id: 'resumo_vendas', name: 'Resumo de vendas', category: 'Pedidos', icon: Package, action: getResumoVendas },
  { id: 'vendas_produtos_mes', name: 'Vendas de produtos por mês', category: 'Pedidos', icon: Package, action: getVendasProdutosPorMes },
  { id: 'exportar_produtos', name: 'Exportar produtos', category: 'Produtos', icon: Box, action: getExportarProdutos },
  { id: 'urls_produtos', name: 'Lista de URLs de produtos', category: 'Produtos', icon: Box, action: getListaURLsProdutos },
  { id: 'pedidos_produtos_detalhados', name: 'Lista de pedidos com produtos detalhados', category: 'Produtos', icon: Box, action: getPedidosProdutosDetalhados },
  { id: 'produtos_aguardando_estoque', name: 'Produtos aguardando estoque', category: 'Produtos', icon: Box, info: true, action: getProdutosAguardandoEstoque },
  { id: 'produtos_com_estoque', name: 'Lista de produtos com estoque', category: 'Produtos', icon: Box, action: getProdutosComEstoque },
  { id: 'vendas_por_produto', name: 'Total de vendas por Produto', category: 'Produtos', icon: Box, action: getVendasPorProduto },
]

const CATEGORY_COLORS: Record<string, string> = {
  'Clientes': '#3b82f6',
  'Financeiro': '#f59e0b',
  'Pedidos': '#10b981',
  'Produtos': '#8b5cf6',
}

// ─── CSV Export ───
function downloadCSV(data: Record<string, any>[], filename: string) {
  if (!data.length) return
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(';'),
    ...data.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(';'))
  ].join('\n')
  
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Componente Principal ───
export function RelatoriosClient() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<typeof REPORTS_LIST[0] | null>(null)
  const [reportData, setReportData] = useState<Record<string, any>[] | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredReports = REPORTS_LIST.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !activeFilter || report.category === activeFilter
    return matchesSearch && matchesFilter
  })

  const categories = [...new Set(REPORTS_LIST.map(r => r.category))]

  function handleReportClick(report: typeof REPORTS_LIST[0]) {
    setSelectedReport(report)
    setReportData(null)
    startTransition(async () => {
      try {
        const data = await report.action()
        setReportData(data)
      } catch (err) {
        console.error('Erro ao carregar relatório:', err)
        setReportData([{ erro: 'Falha ao carregar dados. Verifique a conexão com o banco.' }])
      }
    })
  }

  // ─── DETALHE DO RELATÓRIO ───
  if (selectedReport) {
    const columns = reportData && reportData.length > 0 ? Object.keys(reportData[0]) : []
    const catColor = CATEGORY_COLORS[selectedReport.category] || '#94a3b8'

    return (
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => { setSelectedReport(null); setReportData(null) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid #3f424d',
                borderRadius: '8px', padding: '10px 16px', color: '#cbd5e1',
                cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
              }}
              onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            >
              <ArrowLeft size={16} /> Voltar
            </button>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{selectedReport.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  background: catColor + '20', color: catColor,
                  padding: '2px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                  border: `1px solid ${catColor}40`
                }}>
                  <selectedReport.icon size={12} /> {selectedReport.category}
                </span>
                {reportData && (
                  <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                    {reportData.length} registro{reportData.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          </div>

          {reportData && reportData.length > 0 && !('erro' in reportData[0]) && (
            <button
              onClick={() => downloadCSV(reportData, selectedReport.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none', borderRadius: '8px', padding: '10px 20px',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
              }}
              onMouseEnter={(e: any) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e: any) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Download size={16} /> Exportar CSV
            </button>
          )}
        </div>

        {/* Conteúdo */}
        <div style={{
          background: '#2c2e36', borderRadius: '8px',
          border: '1px solid #3f424d', overflow: 'hidden'
        }}>
          {isPending ? (
            <div style={{ padding: '80px 0', textAlign: 'center' }}>
              <Loader2 size={32} color="#10b981" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Consultando banco de dados...</p>
              <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
            </div>
          ) : reportData && reportData.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #3f424d' }}>
                    {columns.map(col => (
                      <th key={col} style={{
                        padding: '14px 16px', textAlign: 'left',
                        fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8',
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        background: '#1f2025', whiteSpace: 'nowrap'
                      }}>
                        {col.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, idx) => (
                    <tr
                      key={idx}
                      style={{ borderBottom: '1px solid #3f424d', transition: 'background 0.15s' }}
                      onMouseEnter={(e: any) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={(e: any) => e.currentTarget.style.background = 'transparent'}
                    >
                      {columns.map(col => (
                        <td key={col} style={{
                          padding: '12px 16px', fontSize: '0.85rem',
                          color: col === 'status' ? getStatusColor(String(row[col])) : '#e2e8f0',
                          fontWeight: col === 'status' ? 600 : 400,
                          whiteSpace: 'nowrap'
                        }}>
                          {col === 'status' ? (
                            <span style={{
                              display: 'inline-flex', alignItems: 'center',
                              padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem',
                              background: getStatusColor(String(row[col])) + '18',
                              color: getStatusColor(String(row[col])),
                              border: `1px solid ${getStatusColor(String(row[col]))}30`
                            }}>
                              {translateStatus(String(row[col]))}
                            </span>
                          ) : typeof row[col] === 'number' ? (
                            row[col].toLocaleString('pt-BR')
                          ) : (
                            String(row[col] ?? '-')
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : reportData && reportData.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <FileSpreadsheet size={40} color="#3f424d" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 500 }}>Nenhum dado encontrado para este relatório.</p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Quando houver registros, eles aparecerão aqui.</p>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  // ─── LISTA DE RELATÓRIOS ───
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Relatórios</h1>
        <span style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#94a3b8', fontSize: '0.8rem'
        }}>
          <FileSpreadsheet size={14} /> {REPORTS_LIST.length} relatórios disponíveis
        </span>
      </div>

      {/* Filtros por Categoria */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveFilter(null)}
          style={{
            padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem',
            fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
            border: activeFilter === null ? '1px solid #fff' : '1px solid #3f424d',
            background: activeFilter === null ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: activeFilter === null ? '#fff' : '#94a3b8'
          }}
        >
          Todos
        </button>
        {categories.map(cat => {
          const color = CATEGORY_COLORS[cat] || '#94a3b8'
          const isActive = activeFilter === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveFilter(isActive ? null : cat)}
              style={{
                padding: '6px 16px', borderRadius: '20px', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                border: isActive ? `1px solid ${color}` : '1px solid #3f424d',
                background: isActive ? color + '20' : 'transparent',
                color: isActive ? color : '#94a3b8'
              }}
            >
              {cat}
            </button>
          )
        })}
      </div>

      <div style={{
        background: '#2c2e36', borderRadius: '8px',
        border: '1px solid #3f424d', overflow: 'hidden'
      }}>
        {/* Search + Filter */}
        <div style={{
          padding: '20px 24px', display: 'flex',
          justifyContent: 'space-between', alignItems: 'center', gap: '16px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Busque pelo nome do relatório"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%', background: '#1f2025',
                border: '1px solid #3f424d', borderRadius: '6px',
                padding: '10px 16px 10px 44px', color: '#fff',
                fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s'
              }}
              onFocus={(e: any) => e.currentTarget.style.borderColor = '#10b981'}
              onBlur={(e: any) => e.currentTarget.style.borderColor = '#3f424d'}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ width: '100%' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 180px',
            padding: '12px 24px', borderBottom: '1px solid #3f424d', borderTop: '1px solid #3f424d',
            fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.5px'
          }}>
            <div>Nome do Relatório</div>
            <div>Assunto</div>
          </div>

          {filteredReports.map((report, idx) => {
            const Icon = report.icon
            const catColor = CATEGORY_COLORS[report.category] || '#94a3b8'
            return (
              <div
                key={report.id}
                onClick={() => handleReportClick(report)}
                style={{
                  display: 'grid', gridTemplateColumns: '1fr 180px',
                  padding: '16px 24px',
                  borderBottom: idx === filteredReports.length - 1 ? 'none' : '1px solid #3f424d',
                  alignItems: 'center', fontSize: '0.9rem',
                  color: '#cbd5e1', transition: 'all 0.15s', cursor: 'pointer'
                }}
                onMouseEnter={(e: any) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                  e.currentTarget.style.paddingLeft = '28px'
                }}
                onMouseLeave={(e: any) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.paddingLeft = '24px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {report.name}
                  {report.info && <HelpCircle size={14} color="#64748b" />}
                </div>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: catColor + '15', border: `1px solid ${catColor}30`,
                    padding: '4px 12px', borderRadius: '4px', width: 'fit-content',
                    fontSize: '0.75rem', fontWeight: 'bold', color: catColor
                  }}>
                    <Icon size={14} /> {report.category}
                  </div>
                </div>
              </div>
            )
          })}

          {filteredReports.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
              Nenhum relatório encontrado para &ldquo;{searchTerm}&rdquo;.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───
function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    paid: '#10b981', shipped: '#3b82f6', delivered: '#22d3ee',
    pending: '#f59e0b', cancelled: '#ef4444', refunded: '#f97316',
    active: '#10b981', draft: '#94a3b8', archived: '#64748b',
  }
  return map[status] || '#94a3b8'
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue',
    pending: 'Pendente', cancelled: 'Cancelado', refunded: 'Reembolsado',
    active: 'Ativo', draft: 'Rascunho', archived: 'Arquivado',
  }
  return map[status] || status
}
