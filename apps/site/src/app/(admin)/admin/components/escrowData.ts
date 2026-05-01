// ===== ESCROW/PAYMENT MOCK DATA =====

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

export const SHIPPING_OPTIONS: ShippingOption[] = [
  { method: 'PAC', price: 45, days: '8-12 dias úteis', carrier: 'Correios' },
  { method: 'SEDEX', price: 89, days: '3-5 dias úteis', carrier: 'Correios' },
  { method: 'Transportadora', price: 120, days: '5-7 dias úteis', carrier: 'Jadlog' },
]

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-A1B2C3', listingTitle: 'Volante Logitech G923', listingImg: '🎮', condition: 'Seminovo',
    price: 1800, shippingOption: SHIPPING_OPTIONS[1], shippingType: 'correios',
    sellerName: 'Carlos Simuladores', sellerRating: 4.8, sellerSales: 23, sellerSince: '2023-06',
    buyerName: 'Rafael M.', buyerRating: 5.0, buyerPurchases: 3,
    paymentMethod: 'pix', status: 'awaiting_payment',
    createdAt: '29/04/2026 14:30', commissionRate: 0.10, gatewayRate: 0.035,
  },
  {
    id: 'ORD-D4E5F6', listingTitle: 'Pedal Fanatec CSL Elite', listingImg: '🦶', condition: 'Usado - Excelente',
    price: 1500, shippingOption: SHIPPING_OPTIONS[0], shippingType: 'correios',
    sellerName: 'Ana Pedais', sellerRating: 4.5, sellerSales: 11, sellerSince: '2024-02',
    buyerName: 'Lucas T.', buyerRating: 4.7, buyerPurchases: 5,
    paymentMethod: 'credit_card', installments: 6, status: 'paid',
    createdAt: '28/04/2026 10:15', paidAt: '28/04/2026 10:20', commissionRate: 0.10, gatewayRate: 0.035,
  },
  {
    id: 'ORD-G7H8I9', listingTitle: 'Cockpit Playseat Challenge', listingImg: '🪑', condition: 'Usado - Bom estado',
    price: 2800, shippingOption: SHIPPING_OPTIONS[1], shippingType: 'correios',
    sellerName: 'Carlos Simuladores', sellerRating: 4.8, sellerSales: 23, sellerSince: '2023-06',
    buyerName: 'Fernanda S.', buyerRating: 5.0, buyerPurchases: 1,
    paymentMethod: 'pix', status: 'awaiting_shipment',
    createdAt: '27/04/2026 16:00', paidAt: '27/04/2026 16:05', commissionRate: 0.10, gatewayRate: 0.035,
  },
  {
    id: 'ORD-J1K2L3', listingTitle: 'Setup Completo SimRig SR1', listingImg: '🏎️', condition: 'Usado - Bom estado',
    price: 4500, shippingOption: SHIPPING_OPTIONS[2], shippingType: 'transportadora',
    sellerName: 'Bruno Martins', sellerRating: 5.0, sellerSales: 3, sellerSince: '2025-01',
    buyerName: 'Mariana L.', buyerRating: 4.9, buyerPurchases: 2,
    paymentMethod: 'credit_card', installments: 12, status: 'shipped', trackingCode: 'BR123456789CD',
    createdAt: '25/04/2026 09:00', paidAt: '25/04/2026 09:10', shippedAt: '26/04/2026 14:30', commissionRate: 0.10, gatewayRate: 0.035,
  },
  {
    id: 'ORD-M4N5O6', listingTitle: 'Volante Thrustmaster T300 RS', listingImg: '🎯', condition: 'Seminovo',
    price: 1800, shippingOption: { method: 'Retirada', price: 0, days: 'Combinar', carrier: 'Presencial' }, shippingType: 'pickup',
    sellerName: 'Camila Torres', sellerRating: 4.5, sellerSales: 8, sellerSince: '2023-11',
    buyerName: 'Pedro S.', buyerRating: 4.2, buyerPurchases: 4,
    paymentMethod: 'pix', status: 'delivered',
    createdAt: '22/04/2026 11:00', paidAt: '22/04/2026 11:05', shippedAt: '23/04/2026 10:00', deliveredAt: '24/04/2026 15:00', commissionRate: 0.10, gatewayRate: 0.035,
  },
  {
    id: 'ORD-P7Q8R9', listingTitle: 'Monitor Ultrawide 34" Samsung', listingImg: '🖥️', condition: 'Usado - Excelente',
    price: 2200, shippingOption: SHIPPING_OPTIONS[2], shippingType: 'transportadora',
    sellerName: 'Ana Pedais', sellerRating: 4.5, sellerSales: 11, sellerSince: '2024-02',
    buyerName: 'João V.', buyerRating: 5.0, buyerPurchases: 7,
    paymentMethod: 'boleto', status: 'completed',
    createdAt: '18/04/2026 08:00', paidAt: '18/04/2026 10:30', shippedAt: '19/04/2026 09:00', deliveredAt: '24/04/2026 14:00', completedAt: '25/04/2026 08:00', commissionRate: 0.10, gatewayRate: 0.035,
  },
  {
    id: 'ORD-S1T2U3', listingTitle: 'Cockpit GT Omega ART', listingImg: '💺', condition: 'Usado - Marcas de uso',
    price: 3200, shippingOption: SHIPPING_OPTIONS[1], shippingType: 'correios',
    sellerName: 'Bruno Martins', sellerRating: 5.0, sellerSales: 3, sellerSince: '2025-01',
    buyerName: 'Ricardo A.', buyerRating: 3.8, buyerPurchases: 2,
    paymentMethod: 'credit_card', installments: 10, status: 'dispute',
    disputeReason: 'Produto diferente do anúncio — cockpit com ferrugem não mencionada nas fotos.',
    createdAt: '20/04/2026 13:00', paidAt: '20/04/2026 13:10', shippedAt: '21/04/2026 11:00', deliveredAt: '26/04/2026 10:00', disputeAt: '26/04/2026 18:00', commissionRate: 0.10, gatewayRate: 0.035,
  },
]

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
