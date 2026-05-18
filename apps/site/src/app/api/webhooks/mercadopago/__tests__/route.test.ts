import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from '../route'
import * as payments from '@kings/payments'
import * as db from '@kings/db'

// 1. Mocks de dependências externas
vi.mock('@kings/payments', () => ({
  verifyPaymentStatus: vi.fn(),
  pushOrderToOlist: vi.fn().mockResolvedValue({ status: 'success' })
}))

vi.mock('@kings/notifications', () => ({
  sendWhatsappMessage: vi.fn(),
  sendEmailMessage: vi.fn()
}))

vi.mock('@kings/shipping', () => ({
  generateShippingLabel: vi.fn().mockResolvedValue({ success: true, tracking_code: 'BR123' })
}))

vi.mock('@kings/db/server', () => ({
  createServerSupabaseClient: vi.fn()
}))

// 2. Mocks do Supabase para simular o banco de dados
const mockInsert = vi.fn().mockResolvedValue({ error: null })
const supabaseMock = {
  from: vi.fn((table: string) => ({
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    insert: mockInsert,
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => {
      if (table === 'orders') return Promise.resolve({ data: { id: 'PEDIDO-123', status: 'pending', customer_id: 'CUST-1', profiles: { email: 'teste@teste.com' } } })
      if (table === 'order_items') return Promise.resolve({ data: [
        { id: 'ITEM-1', product_id: 'PROD-1', quantity: 1, unit_price: 1000, store_origin: 'msu', product: { title: 'Volante G29', seller_id: 'VEND-1', price: 1000 } }
      ] })
      if (table === 'profiles') return Promise.resolve({ data: { email: 'vendedor@kings.com' } })
      return Promise.resolve({ data: null })
    }),
    delete: vi.fn().mockReturnThis()
  }))
}

// Intercepta a criação do admin client
vi.mock('@kings/db', () => ({
  createAdminClient: vi.fn(() => supabaseMock)
}))

describe('Mercado Pago Webhook (Integração MSU)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('Deve calcular 15% de taxa de plataforma e injetar o status "held" em payouts', async () => {
    // Simulando retorno do MP
    vi.spyOn(payments, 'verifyPaymentStatus').mockResolvedValue({
      status: 'approved',
      external_reference: 'PEDIDO-123',
      payment_method_id: 'pix'
    } as any)

    // Simulando fetch de items (pq no webhook original nós usamos .select().eq() para buscar uma array, não .single())
    // O mock atual do "from" sempre retorna This. Então o resultado do await supabase.from('order_items') na rota é:
    supabaseMock.from.mockImplementation((table: string) => {
      const builder: any = {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        insert: mockInsert,
        eq: vi.fn().mockImplementation((col: string, val: any) => {
           // Se a query for finalizada aqui:
           let data: any = null
           if (table === 'order_items' && col === 'order_id') {
             data = [{ id: 'ITEM-1', product_id: 'PROD-1', quantity: 1, unit_price: 1000, store_origin: 'msu', product: { title: 'Volante G29', seller_id: 'VEND-1', price: 1000 } }]
             return Promise.resolve({ data, error: null })
           }
           // Retorna o próprio builder para permitir chaining
           builder.then = (resolve: any) => resolve({ data, error: null })
           return builder
        }),
        single: vi.fn().mockImplementation(() => {
           if (table === 'orders') return Promise.resolve({ data: { id: 'PEDIDO-123', status: 'pending', customer_id: 'CUST-1', profiles: { email: 'teste@teste.com' } } })
           if (table === 'profiles') return Promise.resolve({ data: { email: 'vendedor@kings.com' } })
           return Promise.resolve({ data: null })
        }),
        delete: vi.fn().mockReturnThis()
      }
      return builder
    })

    // Construindo o Request Fake
    const req = new Request('http://localhost:3000/api/webhooks/mercadopago?topic=payment', {
      method: 'POST',
      body: JSON.stringify({ action: 'payment.created', data: { id: 'PAY-999' } })
    })

    // Executando o POST
    const res = await POST(req)
    
    // Verificações
    expect(res.status).toBe(200)

    // Gross Amount: 1000, Taxa: 15% (150), Net: 850
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      order_item_id: 'ITEM-1',
      seller_id: 'VEND-1',
      gross_amount: 1000,
      platform_fee_amount: 150,
      net_amount: 850,
      status: 'held'
    }))
  })
})
