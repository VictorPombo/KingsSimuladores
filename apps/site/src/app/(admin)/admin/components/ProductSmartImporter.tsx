"use client"

import React, { useState } from 'react';
import { Search, Loader2, Check, AlertCircle, RefreshCw, Layers, Image as ImageIcon, FileText, Settings, Type, Key } from 'lucide-react';

interface ImporterProps {
  onImportComplete: (productData: any) => void;
  onCancel?: () => void;
}

const inputStyle: React.CSSProperties = { width: '100%', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', padding: '10px 14px', color: '#fff', fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s' };
const labelStyle: React.CSSProperties = { display: 'block', color: '#cbd5e1', fontSize: '0.8rem', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' };
const sectionStyle: React.CSSProperties = { background: '#2c2e36', borderRadius: '8px', border: '1px solid #3f424d', padding: '24px', position: 'relative', overflow: 'hidden' };
const buttonStyle: React.CSSProperties = { padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '0.95rem', fontWeight: 600, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', outline: 'none', boxShadow: '0 4px 14px rgba(139, 92, 246, 0.25)' };
const secondaryButtonStyle: React.CSSProperties = { padding: '12px 24px', borderRadius: '8px', background: 'transparent', border: '1px solid #64748b', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', outline: 'none' };
const tabStyle = (active: boolean): React.CSSProperties => ({ padding: '8px 16px', background: active ? '#8b5cf6' : 'transparent', border: 'none', borderRadius: '8px', color: active ? '#fff' : '#94a3b8', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', outline: 'none', transition: 'all 0.2s', boxShadow: active ? '0 2px 10px rgba(139, 92, 246, 0.3)' : 'none' });

export function ProductSmartImporter({ onImportComplete, onCancel }: ImporterProps) {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<'idle' | 'fetching_jina' | 'analyzing_gemini' | 'review' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('geral');

  const startImport = async () => {
    if (!url.trim()) {
      setErrorMsg('Por favor, insira a URL do produto.');
      return;
    }

    try {
      setErrorMsg('');
      setStep('fetching_jina');
      
      const response = await fetch('/api/admin/extract-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro de servidor (${response.status})`);
      }
      
      const parsedData = await response.json();
      
      if (!parsedData || !parsedData.produto) {
        throw new Error("A IA não retornou um conteúdo estruturado válido.");
      }
      
      setExtractedData(parsedData);
      setStep('review');
      
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Ocorreu um erro desconhecido durante a importação.');
      setStep('error');
    }
  };

  const DataBlock = ({ label, value }: { label: string, value: any }) => (
    <div style={{ marginBottom: '16px' }}>
      <label style={labelStyle}>{label}</label>
      <div style={{ padding: '12px', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', color: value ? '#fff' : '#64748b', fontSize: '0.9rem', lineHeight: 1.5 }}>
        {value || 'Não encontrado'}
      </div>
    </div>
  );

  const renderTabContent = () => {
    if (!extractedData) return null;

    switch (activeTab) {
      case 'geral':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <DataBlock label="Título Completo" value={extractedData.produto?.titulo} />
            <DataBlock label="Título Curto" value={extractedData.produto?.titulo_curto} />
            <DataBlock label="Marca / Fabricante" value={extractedData.produto?.marca} />
            <DataBlock label="Modelo / SKU" value={extractedData.produto?.modelo} />
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Preço Referência</label>
              <div style={{ padding: '12px', background: '#1f2025', border: '1px solid #3f424d', borderRadius: '6px', color: '#fff', fontSize: '0.9rem' }}>
                {extractedData.produto?.preco_referencia ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: extractedData.produto?.moeda === 'BRL' ? '#10b981' : '#f59e0b' }}>
                      {extractedData.produto?.moeda === 'USD' ? 'US$ ' : extractedData.produto?.moeda === 'EUR' ? '€ ' : 'R$ '}
                      {extractedData.produto?.preco_referencia}
                    </span>
                    {extractedData.produto?.moeda && extractedData.produto?.moeda !== 'BRL' && (
                      <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>Atenção: Moeda Estrangeira</span>
                    )}
                  </div>
                ) : 'Não encontrado'}
              </div>
            </div>
            <DataBlock label="Categoria Sugerida" value={extractedData.produto?.categoria_sugerida} />
            {extractedData.produto?.tags && extractedData.produto.tags.length > 0 && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Tags</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {extractedData.produto.tags.map((tag: string, i: number) => (
                    <span key={i} style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#a78bfa', padding: '4px 10px', borderRadius: '16px', fontSize: '0.8rem', border: '1px solid rgba(139, 92, 246, 0.3)' }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
            
            {extractedData.fiscal_e_dimensoes && (
              <div style={{ gridColumn: '1 / -1', background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid #3f424d' }}>
                <h4 style={{ color: '#cbd5e1', margin: '0 0 12px 0', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fiscal e Dimensões</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <DataBlock label="NCM" value={extractedData.fiscal_e_dimensoes.ncm} />
                  <DataBlock label="EAN (GTIN)" value={extractedData.fiscal_e_dimensoes.ean} />
                  <DataBlock label="Peso (kg)" value={extractedData.fiscal_e_dimensoes.peso_kg} />
                  <DataBlock label="Largura (cm)" value={extractedData.fiscal_e_dimensoes.largura_cm} />
                  <DataBlock label="Altura (cm)" value={extractedData.fiscal_e_dimensoes.altura_cm} />
                  <DataBlock label="Comprimento (cm)" value={extractedData.fiscal_e_dimensoes.comprimento_cm} />
                </div>
              </div>
            )}
          </div>
        );
      case 'descricoes':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DataBlock label="Descrição Curta" value={extractedData.descricoes?.descricao_curta} />
            {extractedData.descricoes?.diferenciais && extractedData.descricoes.diferenciais.length > 0 && (
              <div>
                <label style={labelStyle}>Diferenciais</label>
                <ul style={{ paddingLeft: '20px', color: '#fff', fontSize: '0.9rem', margin: 0, lineHeight: 1.6 }}>
                  {extractedData.descricoes.diferenciais.map((dif: string, i: number) => (
                    <li key={i}>{dif}</li>
                  ))}
                </ul>
              </div>
            )}
            <DataBlock label="Descrição Completa (HTML)" value={<div dangerouslySetInnerHTML={{ __html: extractedData.descricoes?.descricao_completa || '' }} />} />
          </div>
        );
      case 'especificacoes':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {extractedData.especificacoes && extractedData.especificacoes.length > 0 ? (
              extractedData.especificacoes.map((grupo: any, i: number) => (
                <div key={i} style={{ border: '1px solid #3f424d', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ background: '#1f2025', padding: '10px 16px', fontWeight: 'bold', color: '#fff', borderBottom: '1px solid #3f424d' }}>
                    {grupo.grupo}
                  </div>
                  <div>
                    {grupo.itens?.map((item: any, j: number) => (
                      <div key={j} style={{ display: 'flex', padding: '10px 16px', borderBottom: j === grupo.itens.length - 1 ? 'none' : '1px solid rgba(63, 66, 77, 0.5)', background: j % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <span style={{ width: '40%', color: '#94a3b8', fontSize: '0.9rem' }}>{item.nome}</span>
                        <span style={{ width: '60%', color: '#fff', fontSize: '0.9rem' }}>{item.valor}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>Nenhuma especificação encontrada.</div>
            )}
          </div>
        );
      case 'midia':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '16px' }}>
            {extractedData.imagens && extractedData.imagens.length > 0 ? (
              extractedData.imagens.map((img: any, i: number) => (
                <div key={i} style={{ background: '#1f2025', border: '1px solid #3f424d', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ aspectRatio: '1/1', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src={img.url} alt={img.descricao_alt} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={(e) => (e.currentTarget.style.display = 'none')} />
                  </div>
                  <div style={{ padding: '8px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{img.descricao_alt || 'Sem descrição'}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ color: '#64748b', gridColumn: '1 / -1' }}>Nenhuma imagem encontrada.</div>
            )}
          </div>
        );
      case 'seo':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <DataBlock label="Meta Title" value={extractedData.seo?.meta_title_sugerido} />
            <DataBlock label="Meta Description" value={extractedData.seo?.meta_description_sugerida} />
            <DataBlock label="Slug" value={extractedData.seo?.slug_sugerido} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={sectionStyle}>
      {/* Absolute Gradient Decorator */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', position: 'relative', zIndex: 1 }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#fff', margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <RefreshCw size={22} color="#8b5cf6" />
            Importador de Produtos via IA
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Cole a URL do site oficial do produto e deixe a IA extrair e traduzir os dados automaticamente.</p>
        </div>
        {(step === 'idle' || step === 'error') && onCancel && (
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            Fechar
          </button>
        )}
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {step === 'idle' || step === 'error' ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>URL do Produto Externo *</label>
              <div style={{ position: 'relative' }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ex: https://mozaracing.com/product/r5"
                  style={{ ...inputStyle, paddingLeft: '36px' }}
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={startImport} style={buttonStyle}>
                <Layers size={16} /> Iniciar Extração
              </button>
            </div>

            {step === 'error' && (
              <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', color: '#fca5a5' }}>
                <AlertCircle size={20} />
                <span style={{ fontSize: '0.9rem' }}>{errorMsg}</span>
              </div>
            )}
          </div>
        ) : step === 'fetching_jina' || step === 'analyzing_gemini' ? (
          <div style={{ padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 size={40} color="#8b5cf6" style={{ animation: 'spin 1.5s linear infinite', marginBottom: '20px' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              {step === 'fetching_jina' ? 'Acessando a página do produto...' : 'Analisando e processando informações...'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              {step === 'fetching_jina' ? 'Isso pode demorar alguns segundos dependendo do site original.' : 'A inteligência artificial está extraindo imagens, ficha técnica e traduzindo o conteúdo...'}
            </p>
          </div>
        ) : step === 'review' ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #3f424d' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check size={20} color="#10b981" />
                </div>
                <div>
                  <h3 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '1.05rem' }}>Dados Estruturados com Sucesso</h3>
                  <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>Confiança da Extração: <strong style={{ color: '#fff' }}>{extractedData?.confianca?.toUpperCase() || 'MÉDIA'}</strong></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setStep('idle')} style={secondaryButtonStyle}>
                  Voltar / Descartar
                </button>
                <button onClick={() => onImportComplete(extractedData)} style={{...buttonStyle, background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'}}>
                  <Check size={18} /> Importar para o Produto
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px', background: '#1f2025', padding: '6px', borderRadius: '12px', marginBottom: '24px', width: 'fit-content', border: '1px solid #3f424d' }}>
              <button style={tabStyle(activeTab === 'geral')} onClick={() => setActiveTab('geral')}><FileText size={16} /> Geral</button>
              <button style={tabStyle(activeTab === 'descricoes')} onClick={() => setActiveTab('descricoes')}><Type size={16} /> Descrições</button>
              <button style={tabStyle(activeTab === 'especificacoes')} onClick={() => setActiveTab('especificacoes')}><Settings size={16} /> Ficha Técnica</button>
              <button style={tabStyle(activeTab === 'midia')} onClick={() => setActiveTab('midia')}><ImageIcon size={16} /> Imagens</button>
              <button style={tabStyle(activeTab === 'seo')} onClick={() => setActiveTab('seo')}><Search size={16} /> SEO</button>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '8px' }}>
              {renderTabContent()}
            </div>
          </div>
        ) : null}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
