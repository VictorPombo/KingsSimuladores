/**
 * @kings/utils — Helpers compartilhados
 */

/** Formatar preço em BRL */
export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

/** Formatar data relativa */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

/** Gerar slug a partir de texto */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Formatar CPF ou CNPJ */
export function formatCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 11) {
    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

/** Formatar CEP */
export function formatCep(value: string): string {
  return value.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2')
}

/** Calcular parcelas */
export function calculateInstallments(price: number, maxInstallments = 12): Array<{ count: number; value: number; total: number }> {
  const result = []
  for (let i = 1; i <= maxInstallments; i++) {
    const value = price / i
    if (value < 5) break // Mercado Pago mín. R$5 por parcela
    result.push({
      count: i,
      value: Math.round(value * 100) / 100,
      total: price,
    })
  }
  return result
}

/** Truncar texto */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/** Gerar ID de pedido legível */
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `KH-${timestamp}-${random}`
}

/** Brand helpers */
export type BrandName = 'kings' | 'msu'

export const BRAND_CONFIG = {
  kings: {
    name: 'Kings Simuladores',
    domain: 'kingssimuladores.com.br',
    primaryColor: '#00e5ff',
    gradient: 'linear-gradient(135deg, #00e5ff, #0097a7)',
  },
  msu: {
    name: 'Meu Simulador Usado',
    domain: 'meusimuladorusado.com.br',
    primaryColor: '#8b5cf6',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
  },
} as const
