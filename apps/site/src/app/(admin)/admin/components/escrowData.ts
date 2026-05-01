// ===== ESCROW TYPES & UTILS (PRODUÇÃO) =====

export type OrderStatus = 'awaiting_payment' | 'paid' | 'awaiting_shipment' | 'shipped' | 'delivered' | 'completed' | 'dispute' | 'refunded'

export type ShippingOption = { method: string; price: number; days: string; carrier: string }

export type PaymentMethod = 'credit_card' | 'pix' | 'boleto'

export type Order = {
  id: string; listingTitle: string; listingImg: string; condition: string
  price: number; shippingOption: ShippingOption; shippingType: 'correios' | 'transportadora' | 'pickup'
  sellerName: string; sellerRating: number; sellerSales: number; sellerSince: string
  buyerName: string; buyerRating: number; buyerPurchases: number
  paymentMethod: PaymentMethod; installments?: number
  status: OrderStatus; trackingCode?: string
  createdAt: string; paidAt?: string; shippedAt?: string; deliveredAt?: string; completedAt?: string
  disputeReason?: string; disputeAt?: string
  commissionRate: number; gatewayRate: number
}

export function calcOrder(order: Order) {
  const subtotal = order.price
  const shipping = order.shippingOption.price
  const total = subtotal + shipping
  const pixDiscount = order.paymentMethod === 'pix' ? subtotal * 0.05 : 0
  const totalWithDiscount = total - pixDiscount
  const commission = subtotal * order.commissionRate
  const gateway = totalWithDiscount * order.gatewayRate
  const sellerNet = subtotal - commission - gateway
  return { subtotal, shipping, total, pixDiscount, totalWithDiscount, commission, gateway, sellerNet }
}

export const STATUS_MAP: Record<OrderStatus, { label: string; color: string; bg: string }> = {
  awaiting_payment: { label: 'Aguardando Pagamento', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  paid: { label: 'Pago — Cofre', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  awaiting_shipment: { label: 'Aguardando Envio', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  shipped: { label: 'Em Trânsito', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  delivered: { label: 'Entregue — Conferência', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  completed: { label: 'Concluído', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  dispute: { label: 'Em Disputa', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  refunded: { label: 'Reembolsado', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}

export function formatBRL(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}
