'use client'

import React, { useState } from 'react'
import { ShieldCheck, Package, Clock, Video, X, CheckCircle2 } from 'lucide-react'

interface TermsModalProps {
  onAccept: () => void
  onCancel: () => void
}

const rules = [
  {
    icon: <Package size={28} />,
    title: 'Anúncio e Taxas',
    color: '#06b6d4',
    items: [
      'Você anuncia pelo valor desejado',
      'Taxa administrativa: 15% sobre o valor da venda',
      'Exemplo: Anunciei R$ 5.000 → Recebo R$ 4.250',
      'O repasse é feito já com o desconto da taxa',
    ]
  },
  {
    icon: <ShieldCheck size={28} />,
    title: 'Compra Segura (Escrow)',
    color: '#06d6a0',
    items: [
      'Comprador paga direto para a plataforma',
      'Dinheiro fica retido até confirmação do recebimento',
      'Criamos grupo no WhatsApp com vendedor, comprador e suporte',
      'Acompanhamos todo o envio e logística',
    ]
  },
  {
    icon: <Video size={28} />,
    title: 'Recebimento e Regra das 24h',
    color: '#f59e0b',
    items: [
      'O comprador tem 24h para testar o equipamento',
      'OBRIGATÓRIO: gravar vídeo contínuo da abertura da caixa (unboxing)',
      'Vídeo sem cortes e sem interrupções',
      'Sem vídeo, não há direito a contestação',
    ]
  },
  {
    icon: <Clock size={28} />,
    title: 'Prazos e Liberação',
    color: '#a78bfa',
    items: [
      'Após 24h sem contestação, o valor é liberado ao vendedor',
      'Em caso de disputa, a equipe Kings avalia as evidências',
      'Fraudes resultam em bloqueio permanente da conta',
    ]
  },
]

export function TermsModal({ onAccept, onCancel }: TermsModalProps) {
  const [scrolledToEnd, setScrolledToEnd] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
    if (atBottom) setScrolledToEnd(true)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(12px)',
      animation: 'fadeIn 0.3s ease'
    }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .terms-card:hover { border-color: rgba(255,255,255,0.15) !important; }
      `}} />

      <div style={{
        width: '100%', maxWidth: '640px', maxHeight: '90vh',
        background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.98) 0%, rgba(8, 12, 24, 0.99) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1.5rem',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideUp 0.4s ease',
        boxShadow: '0 25px 80px rgba(0,0,0,0.6)'
      }}>

        {/* Header */}
        <div style={{
          padding: '2rem 2rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} color="#06b6d4" />
              </div>
              <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff' }}>
                Regras do Marketplace
              </h2>
            </div>
            <p style={{ margin: 0, color: '#71717a', fontSize: '0.9rem' }}>
              Leia atentamente antes de criar seu primeiro anúncio
            </p>
          </div>
          <button onClick={onCancel} style={{
            background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '10px',
            width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#71717a', transition: 'all 0.2s'
          }}>
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Rules */}
        <div
          onScroll={handleScroll}
          style={{
            flex: 1, overflowY: 'auto', padding: '1.5rem 2rem',
            display: 'flex', flexDirection: 'column', gap: '1rem'
          }}
        >
          {rules.map((rule, i) => (
            <div
              key={i}
              className="terms-card"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '1rem', padding: '1.25rem',
                transition: 'border-color 0.2s'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ color: rule.color }}>{rule.icon}</div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{rule.title}</h3>
              </div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {rule.items.map((item, j) => (
                  <li key={j} style={{ color: '#a1a1aa', fontSize: '0.88rem', lineHeight: 1.5 }}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Commission Calculator */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.06)',
            border: '1px solid rgba(6, 182, 212, 0.15)',
            borderRadius: '1rem', padding: '1.25rem', textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#06b6d4', fontWeight: 700, marginBottom: '8px' }}>
              Simulação de Recebimento
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              {[
                { label: 'Anúncio', value: 'R$ 3.000', sub: 'Preço do anúncio' },
                { label: 'Taxa (15%)', value: '- R$ 450', sub: 'Comissão Kings' },
                { label: 'Você recebe', value: 'R$ 2.550', sub: 'Depositado via Pix' },
              ].map((col, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.7rem', color: '#71717a', textTransform: 'uppercase', marginBottom: '4px' }}>{col.label}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: i === 2 ? '#06d6a0' : '#fff' }}>{col.value}</div>
                  <div style={{ fontSize: '0.7rem', color: '#52525b', marginTop: '2px' }}>{col.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem 2rem', borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: '12px'
        }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 600,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#a1a1aa', cursor: 'pointer', transition: 'all 0.2s'
          }}>
            Cancelar
          </button>
          <button
            onClick={onAccept}
            disabled={!scrolledToEnd}
            style={{
              flex: 2, padding: '14px', borderRadius: '12px', fontSize: '0.95rem', fontWeight: 800,
              background: scrolledToEnd ? '#06b6d4' : 'rgba(6, 182, 212, 0.2)',
              border: 'none', color: scrolledToEnd ? '#000' : '#52525b',
              cursor: scrolledToEnd ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <CheckCircle2 size={18} />
            {scrolledToEnd ? 'Li e Concordo com as Regras' : 'Role para baixo para aceitar'}
          </button>
        </div>
      </div>
    </div>
  )
}
