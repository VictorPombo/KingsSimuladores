'use client'

import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, XCircle, RefreshCw, Download, ArrowRight } from 'lucide-react'
import React, { useState, useRef, useTransition } from 'react'
import { importProducts } from './actions'

type ImportResult = { row: number; title: string; status: 'ok' | 'updated' | 'error'; msg?: string }

const EXPECTED_HEADERS = ['titulo', 'slug', 'descricao', 'preco', 'preco_comparativo', 'estoque', 'sku', 'marca', 'categoria', 'status', 'peso_kg']

function parseCsv(text: string) {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length < 2) return { headers: [], rows: [] }

  const sep = lines[0].includes(';') ? ';' : ','
  const headers = lines[0].split(sep).map(h => h.trim().replace(/^"|"$/g, '').toLowerCase())
  const rows = lines.slice(1).map(line => {
    const vals = line.split(sep).map(v => v.trim().replace(/^"|"$/g, ''))
    const obj: Record<string, string> = {}
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })

  return { headers, rows }
}

export default function ImportarProdutosPage() {
  const [dragOver, setDragOver] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<Record<string, string>[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [results, setResults] = useState<ImportResult[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File) => {
    setFile(f)
    setResults(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { headers: h, rows } = parseCsv(text)
      setHeaders(h)
      setPreview(rows.slice(0, 5))
    }
    reader.readAsText(f, 'UTF-8')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0])
  }

  const handleImport = () => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const { rows } = parseCsv(text)
      startTransition(async () => {
        const res = await importProducts(rows as any)
        setResults(res)
      })
    }
    reader.readAsText(file, 'UTF-8')
  }

  const handleDownloadTemplate = () => {
    const csv = '\uFEFF' + EXPECTED_HEADERS.join(';') + '\n' + 'Volante Exemplo;volante-exemplo;Descrição do produto;1500.00;1800.00;10;VOL-001;Kings Simuladores;Volantes;active;2.5'
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
    a.download = 'template_importacao.csv'; a.click()
  }

  const successCount = results?.filter(r => r.status === 'ok').length || 0
  const updatedCount = results?.filter(r => r.status === 'updated').length || 0
  const errorCount = results?.filter(r => r.status === 'error').length || 0

  return (
    <div style={{ padding: '2rem', minHeight: '100vh', color: '#fff', background: '#1e1e1e' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>Importar Produtos</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '4px' }}>Importe produtos em massa via arquivo CSV</p>
          </div>
          <button onClick={handleDownloadTemplate}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', padding: '10px 16px', color: '#cbd5e1', fontWeight: 500, fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s' }}>
            <Download size={16} /> Baixar Template
          </button>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            background: dragOver ? 'rgba(139,92,246,0.08)' : file ? 'rgba(16,185,129,0.05)' : '#2c2e36',
            borderRadius: '12px',
            border: `2px dashed ${dragOver ? '#8b5cf6' : file ? '#10b981' : '#3f424d'}`,
            padding: '50px 40px', textAlign: 'center', marginBottom: '24px',
            cursor: 'pointer', transition: 'all 0.3s',
          }}
        >
          {file ? (
            <>
              <CheckCircle size={36} color="#10b981" style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#10b981', fontSize: '1rem', fontWeight: 600, margin: '0 0 4px 0' }}>{file.name}</p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                {(file.size / 1024).toFixed(1)} KB — {preview.length > 0 ? `${preview.length}+ linhas detectadas` : 'Processando...'}
              </p>
              <p style={{ color: '#4a4d57', fontSize: '0.75rem', marginTop: '8px' }}>Clique para trocar o arquivo</p>
            </>
          ) : (
            <>
              <Upload size={36} color={dragOver ? '#8b5cf6' : '#4a4d57'} style={{ margin: '0 auto 12px', display: 'block' }} />
              <p style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 600, margin: '0 0 6px 0' }}>
                Arraste um arquivo CSV aqui ou clique para selecionar
              </p>
              <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0 }}>
                Formato aceito: .csv (até 5MB) — Separador: ponto e vírgula (;)
              </p>
            </>
          )}
          <input ref={inputRef} type="file" accept=".csv" style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />
        </div>

        {/* Preview Table */}
        {preview.length > 0 && !results && (
          <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #3f424d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet size={16} color="#8b5cf6" /> Pré-visualização (primeiras {preview.length} linhas)
              </h3>
              <span style={{ color: '#64748b', fontSize: '0.75rem' }}>{headers.length} colunas detectadas</span>
            </div>
            <div className="admin-overflow-table">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {headers.slice(0, 6).map(h => (
                      <th key={h} style={{
                        padding: '8px 12px', textAlign: 'left', fontSize: '0.68rem', fontWeight: 'bold',
                        color: EXPECTED_HEADERS.includes(h) ? '#10b981' : '#ef4444',
                        textTransform: 'uppercase', background: '#1f2025', whiteSpace: 'nowrap',
                      }}>{h}</th>
                    ))}
                    {headers.length > 6 && <th style={{ padding: '8px 12px', background: '#1f2025', color: '#64748b', fontSize: '0.68rem' }}>+{headers.length - 6}</th>}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #3f424d' }}>
                      {headers.slice(0, 6).map(h => (
                        <td key={h} style={{ padding: '8px 12px', color: '#cbd5e1', fontSize: '0.8rem', whiteSpace: 'nowrap', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {row[h] || <span style={{ color: '#4a4d57' }}>—</span>}
                        </td>
                      ))}
                      {headers.length > 6 && <td style={{ padding: '8px 12px', color: '#4a4d57', fontSize: '0.75rem' }}>...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Import Button */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid #3f424d', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={handleImport} disabled={isPending}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  background: isPending ? '#4a4d57' : 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: '8px', padding: '10px 24px', color: '#fff',
                  fontWeight: 600, fontSize: '0.85rem', cursor: isPending ? 'wait' : 'pointer',
                  boxShadow: isPending ? 'none' : '0 2px 8px rgba(16,185,129,0.3)', transition: 'all 0.2s',
                }}>
                {isPending ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Importando...</> : <><ArrowRight size={16} /> Iniciar Importação</>}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {results && (
          <div style={{ marginBottom: '24px' }}>
            {/* Summary KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#2c2e36', borderRadius: '10px', padding: '16px', border: '1px solid #10b98130' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#10b981', textTransform: 'uppercase' }}>Novos</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981', marginTop: '4px' }}>{successCount}</div>
              </div>
              <div style={{ background: '#2c2e36', borderRadius: '10px', padding: '16px', border: '1px solid #22d3ee30' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#22d3ee', textTransform: 'uppercase' }}>Atualizados</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#22d3ee', marginTop: '4px' }}>{updatedCount}</div>
              </div>
              <div style={{ background: '#2c2e36', borderRadius: '10px', padding: '16px', border: '1px solid #ef444430' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#ef4444', textTransform: 'uppercase' }}>Erros</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444', marginTop: '4px' }}>{errorCount}</div>
              </div>
            </div>

            {/* Row-by-row results */}
            <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #3f424d' }}>
                <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: 0 }}>Resultado da Importação</h3>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {results.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', borderBottom: '1px solid #3f424d20' }}>
                    {r.status === 'ok' && <CheckCircle size={16} color="#10b981" />}
                    {r.status === 'updated' && <RefreshCw size={16} color="#22d3ee" />}
                    {r.status === 'error' && <XCircle size={16} color="#ef4444" />}
                    <span style={{ color: '#64748b', fontSize: '0.75rem', width: '40px' }}>#{r.row}</span>
                    <span style={{ color: '#e2e8f0', fontSize: '0.85rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</span>
                    <span style={{
                      fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
                      background: r.status === 'ok' ? '#10b98118' : r.status === 'updated' ? '#22d3ee18' : '#ef444418',
                      color: r.status === 'ok' ? '#10b981' : r.status === 'updated' ? '#22d3ee' : '#ef4444',
                    }}>
                      {r.status === 'ok' ? 'CRIADO' : r.status === 'updated' ? 'ATUALIZADO' : 'ERRO'}
                    </span>
                    {r.msg && <span style={{ color: '#ef4444', fontSize: '0.7rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.msg}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Reset */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
              <button onClick={() => { setFile(null); setPreview([]); setHeaders([]); setResults(null) }}
                style={{ background: 'transparent', border: '1px solid #3f424d', borderRadius: '8px', padding: '10px 20px', color: '#94a3b8', cursor: 'pointer', fontWeight: 500, fontSize: '0.85rem' }}>
                Importar outro arquivo
              </button>
            </div>
          </div>
        )}

        {/* Instructions Card */}
        {!file && (
          <div style={{ background: '#2c2e36', borderRadius: '10px', border: '1px solid #3f424d', padding: '24px' }}>
            <h3 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileSpreadsheet size={16} color="#8b5cf6" /> Formato do CSV
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: '14px' }}>Seu arquivo CSV deve conter as seguintes colunas (na ordem):</p>
            <div style={{ background: '#1f2025', borderRadius: '8px', padding: '14px 16px', overflow: 'auto', marginBottom: '14px' }}>
              <code style={{ color: '#10b981', fontSize: '0.78rem', whiteSpace: 'pre' }}>
                {EXPECTED_HEADERS.join(';')}
              </code>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {EXPECTED_HEADERS.map(h => (
                <div key={h} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem' }}>
                  <span style={{ color: '#10b981' }}>•</span>
                  <span style={{ color: '#94a3b8', fontFamily: 'monospace' }}>{h}</span>
                  <span style={{ color: '#4a4d57' }}>
                    {h === 'titulo' ? '(obrigatório)' : h === 'slug' ? '(obrigatório)' : h === 'preco' ? '(obrigatório)' : h === 'sku' ? '(obrigatório)' : h === 'marca' ? '(obrigatório)' : '(opcional)'}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ padding: '12px 16px', background: '#f59e0b12', border: '1px solid #f59e0b25', borderRadius: '8px', fontSize: '0.8rem', color: '#f59e0b', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertTriangle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>A primeira linha deve conter os cabeçalhos. Produtos existentes com o mesmo SKU serão atualizados automaticamente.</span>
            </div>
          </div>
        )}

        {/* Spin animation */}
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
      </div>
    </div>
  )
}
