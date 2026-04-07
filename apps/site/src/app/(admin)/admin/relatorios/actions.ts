'use server'

import { createServerSupabaseClient } from '@kings/db/server'

// ─── Tipos ───
type ReportRow = Record<string, any>

// ─── CLIENTES ───

export async function getClientesComPedidos(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, total, created_at, status, profiles!customer_id(full_name, email, phone)')
    .order('created_at', { ascending: false })

  if (!orders) return []

  // Agrupar por customer_id
  const map = new Map<string, any>()
  for (const o of orders as any[]) {
    const cid = o.customer_id
    if (!map.has(cid)) {
      map.set(cid, {
        cliente: o.profiles?.full_name || 'Sem nome',
        email: o.profiles?.email || '-',
        telefone: o.profiles?.phone || '-',
        total_pedidos: 0,
        valor_total: 0,
        ultimo_pedido: o.created_at,
      })
    }
    const entry = map.get(cid)!
    entry.total_pedidos++
    entry.valor_total += Number(o.total || 0)
  }
  return Array.from(map.values())
}

export async function getClientesSemPedidos(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  
  // Todos os perfis
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, created_at')
    .eq('role', 'client')

  // Todos os customer_ids com pedidos
  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id')

  const customerIds = new Set((orders || []).map((o: any) => o.customer_id))

  return (profiles || [])
    .filter((p: any) => !customerIds.has(p.id))
    .map((p: any) => ({
      cliente: p.full_name || 'Sem nome',
      email: p.email || '-',
      telefone: p.phone || '-',
      cadastrado_em: new Date(p.created_at).toLocaleDateString('pt-BR'),
    }))
}

export async function getExportarClientes(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('full_name, email, phone, cpf_cnpj, role, created_at')
    .order('created_at', { ascending: false })

  return (data || []).map((p: any) => ({
    nome: p.full_name || '-',
    email: p.email || '-',
    telefone: p.phone || '-',
    cpf_cnpj: p.cpf_cnpj || '-',
    tipo: p.role,
    cadastrado_em: new Date(p.created_at).toLocaleDateString('pt-BR'),
  }))
}

export async function getPedidosAprovadosReprovados(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('customer_id, status, profiles!customer_id(full_name, email)')

  if (!orders) return []

  const map = new Map<string, any>()
  for (const o of orders as any[]) {
    const cid = o.customer_id
    if (!map.has(cid)) {
      map.set(cid, {
        cliente: o.profiles?.full_name || 'Sem nome',
        email: o.profiles?.email || '-',
        aprovados: 0,
        reprovados: 0,
        pendentes: 0,
        total: 0,
      })
    }
    const entry = map.get(cid)!
    entry.total++
    if (['paid', 'shipped', 'delivered'].includes(o.status)) entry.aprovados++
    else if (['cancelled', 'refunded'].includes(o.status)) entry.reprovados++
    else entry.pendentes++
  }
  return Array.from(map.values())
}

// ─── FINANCEIRO ───

export async function getTarifasTransacoes(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('orders')
    .select('id, total, shipping_cost, discount, payment_method, status, created_at')
    .in('status', ['paid', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })

  return (data || []).map((o: any) => {
    const taxa = Number(o.total) * 0.0499 // Taxa MP padrão
    return {
      pedido: '#' + o.id.split('-')[0],
      valor_total: `R$ ${Number(o.total).toFixed(2)}`,
      taxa_mp: `R$ ${taxa.toFixed(2)}`,
      frete: `R$ ${Number(o.shipping_cost || 0).toFixed(2)}`,
      desconto: `R$ ${Number(o.discount || 0).toFixed(2)}`,
      metodo: o.payment_method || '-',
      data: new Date(o.created_at).toLocaleDateString('pt-BR'),
    }
  })
}

// ─── PEDIDOS ───

export async function getRelatorioPedidos(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('orders')
    .select('id, brand_origin, status, total, shipping_cost, discount, payment_method, tracking_code, created_at, profiles!customer_id(full_name, email)')
    .order('created_at', { ascending: false })

  return (data || []).map((o: any) => ({
    pedido: '#' + o.id.split('-')[0],
    cliente: o.profiles?.full_name || '-',
    email: o.profiles?.email || '-',
    marca: o.brand_origin === 'kings' ? 'Kings' : 'MSU',
    status: o.status,
    total: `R$ ${Number(o.total).toFixed(2)}`,
    frete: `R$ ${Number(o.shipping_cost || 0).toFixed(2)}`,
    desconto: `R$ ${Number(o.discount || 0).toFixed(2)}`,
    pagamento: o.payment_method || '-',
    rastreio: o.tracking_code || '-',
    data: new Date(o.created_at).toLocaleDateString('pt-BR'),
  }))
}

export async function getPedidosComCupom(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('orders')
    .select('id, total, discount, coupon_id, status, created_at, profiles!customer_id(full_name), coupons!coupon_id(code, type, value)')
    .not('coupon_id', 'is', null)
    .order('created_at', { ascending: false })

  return (data || []).map((o: any) => ({
    pedido: '#' + o.id.split('-')[0],
    cliente: o.profiles?.full_name || '-',
    cupom: o.coupons?.code || '-',
    tipo_cupom: o.coupons?.type === 'percentage' ? 'Percentual' : 'Fixo',
    valor_cupom: o.coupons?.type === 'percentage' ? `${o.coupons?.value}%` : `R$ ${Number(o.coupons?.value || 0).toFixed(2)}`,
    desconto_aplicado: `R$ ${Number(o.discount || 0).toFixed(2)}`,
    total_pedido: `R$ ${Number(o.total).toFixed(2)}`,
    status: o.status,
    data: new Date(o.created_at).toLocaleDateString('pt-BR'),
  }))
}

export async function getResumoVendas(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('orders')
    .select('brand_origin, status, total, shipping_cost, discount, created_at')
    .in('status', ['paid', 'shipped', 'delivered'])
    .order('created_at', { ascending: false })

  if (!data || data.length === 0) return [{ info: 'Nenhuma venda registrada.' }]

  // Agrupar por mês
  const map = new Map<string, any>()
  for (const o of data as any[]) {
    const d = new Date(o.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!map.has(key)) {
      map.set(key, { periodo: key, vendas: 0, faturamento: 0, frete: 0, descontos: 0, kings: 0, msu: 0 })
    }
    const e = map.get(key)!
    e.vendas++
    e.faturamento += Number(o.total)
    e.frete += Number(o.shipping_cost || 0)
    e.descontos += Number(o.discount || 0)
    if (o.brand_origin === 'kings') e.kings++
    else e.msu++
  }

  return Array.from(map.values()).map(e => ({
    periodo: e.periodo,
    vendas: e.vendas,
    faturamento: `R$ ${e.faturamento.toFixed(2)}`,
    frete: `R$ ${e.frete.toFixed(2)}`,
    descontos: `R$ ${e.descontos.toFixed(2)}`,
    kings: e.kings,
    msu: e.msu,
  }))
}

export async function getPedidosEnvioDesabilitado(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('orders')
    .select('id, total, status, created_at, profiles!customer_id(full_name)')
    .eq('shipping_cost', 0)
    .order('created_at', { ascending: false })

  return (data || []).map((o: any) => ({
    pedido: '#' + o.id.split('-')[0],
    cliente: o.profiles?.full_name || '-',
    total: `R$ ${Number(o.total).toFixed(2)}`,
    status: o.status,
    data: new Date(o.created_at).toLocaleDateString('pt-BR'),
  }))
}

// ─── PRODUTOS ───

export async function getExportarProdutos(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('title, slug, sku, price, price_compare, stock, status, weight_kg, created_at')
    .order('created_at', { ascending: false })

  return (data || []).map((p: any) => ({
    produto: p.title,
    sku: p.sku || '-',
    slug: p.slug,
    preco: `R$ ${Number(p.price).toFixed(2)}`,
    preco_comparativo: p.price_compare ? `R$ ${Number(p.price_compare).toFixed(2)}` : '-',
    estoque: p.stock,
    status: p.status,
    peso_kg: p.weight_kg || '-',
    criado_em: new Date(p.created_at).toLocaleDateString('pt-BR'),
  }))
}

export async function getListaURLsProdutos(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('title, slug, status')
    .eq('status', 'active')
    .order('title', { ascending: true })

  return (data || []).map((p: any) => ({
    produto: p.title,
    url: `/produto/${p.slug}`,
    status: p.status,
  }))
}

export async function getProdutosComEstoque(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('title, sku, price, stock, status')
    .gt('stock', 0)
    .order('stock', { ascending: false })

  return (data || []).map((p: any) => ({
    produto: p.title,
    sku: p.sku || '-',
    preco: `R$ ${Number(p.price).toFixed(2)}`,
    estoque: p.stock,
    status: p.status,
  }))
}

export async function getProdutosAguardandoEstoque(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('products')
    .select('title, sku, price, stock, status, created_at')
    .eq('stock', 0)
    .order('created_at', { ascending: false })

  return (data || []).map((p: any) => ({
    produto: p.title,
    sku: p.sku || '-',
    preco: `R$ ${Number(p.price).toFixed(2)}`,
    estoque: 0,
    status: p.status,
    criado_em: new Date(p.created_at).toLocaleDateString('pt-BR'),
  }))
}

export async function getVendasPorProduto(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('order_items')
    .select('product_id, quantity, total_price, products!product_id(title, sku)')

  if (!data) return []

  const map = new Map<string, any>()
  for (const item of data as any[]) {
    const pid = item.product_id || 'marketplace'
    if (!map.has(pid)) {
      map.set(pid, {
        produto: item.products?.title || 'Produto Marketplace',
        sku: item.products?.sku || '-',
        unidades_vendidas: 0,
        faturamento: 0,
      })
    }
    const e = map.get(pid)!
    e.unidades_vendidas += item.quantity
    e.faturamento += Number(item.total_price)
  }

  return Array.from(map.values())
    .sort((a, b) => b.faturamento - a.faturamento)
    .map(e => ({
      ...e,
      faturamento: `R$ ${e.faturamento.toFixed(2)}`,
    }))
}

export async function getVendasProdutosPorMes(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('order_items')
    .select('quantity, total_price, orders!order_id(created_at, status), products!product_id(title)')
    
  if (!data) return []

  const map = new Map<string, any>()
  for (const item of data as any[]) {
    if (!item.orders) continue
    const d = new Date(item.orders.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const product = item.products?.title || 'Marketplace'
    const mapKey = `${key}__${product}`

    if (!map.has(mapKey)) {
      map.set(mapKey, { periodo: key, produto: product, unidades: 0, faturamento: 0 })
    }
    const e = map.get(mapKey)!
    e.unidades += item.quantity
    e.faturamento += Number(item.total_price)
  }

  return Array.from(map.values())
    .sort((a, b) => b.periodo.localeCompare(a.periodo))
    .map(e => ({
      ...e,
      faturamento: `R$ ${e.faturamento.toFixed(2)}`,
    }))
}

export async function getPedidosProdutosDetalhados(): Promise<ReportRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('order_items')
    .select('quantity, unit_price, total_price, orders!order_id(id, status, created_at, profiles!customer_id(full_name)), products!product_id(title, sku)')
    .order('created_at', { referencedTable: 'orders', ascending: false })

  return (data || []).map((item: any) => ({
    pedido: item.orders ? '#' + item.orders.id.split('-')[0] : '-',
    cliente: item.orders?.profiles?.full_name || '-',
    produto: item.products?.title || 'Marketplace',
    sku: item.products?.sku || '-',
    quantidade: item.quantity,
    preco_unitario: `R$ ${Number(item.unit_price).toFixed(2)}`,
    total: `R$ ${Number(item.total_price).toFixed(2)}`,
    status_pedido: item.orders?.status || '-',
    data: item.orders ? new Date(item.orders.created_at).toLocaleDateString('pt-BR') : '-',
  }))
}
