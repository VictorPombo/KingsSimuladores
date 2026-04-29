import { Container } from '@kings/ui'
import { ChevronRight, Star, ShoppingCart, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'

import { createServerSupabaseClient } from '@kings/db/server'

interface Props {
  searchParams: {
    categoria?: string
    ordenar?: string
    marca?: string
  }
}

export default async function SevenProductsPage({ searchParams }: Props) {
  const supabase = await createServerSupabaseClient()
  const currentCategory = searchParams.categoria
  const currentMarca = searchParams.marca
  
  // 1. Fetch Brand ID
  const { data: brand } = await supabase.from('brands').select('id').eq('name', 'seven').single()
  
  // 2. Fetch Categories
  let categories: any[] = []
  if (brand) {
    const { data: cats } = await supabase.from('categories').select('id, name, slug').eq('brand_scope', 'seven')
    if (cats) categories = cats
  }

  // 3. Fetch Products
  let query = supabase
    .from('products')
    .select('id, title, price, slug, images, category_id, stock')
    .eq('brand_id', brand?.id)
    .eq('status', 'active')

  if (currentCategory) {
    const targetCat = categories.find(c => c.slug === currentCategory)
    if (targetCat) {
      query = query.eq('category_id', targetCat.id)
    }
  }
  if (currentMarca) {
    query = query.ilike('attributes->>marca', `%${currentMarca}%`)
  }

  // Ordenação Simples
  if (searchParams.ordenar === 'menor-preco') query = query.order('price', { ascending: true })
  else if (searchParams.ordenar === 'maior-preco') query = query.order('price', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data: products } = await query
  const displayProducts = products || []
  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 100px)' }}>
      <Container>
        
        {/* Top Header & Breadcrumbs */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>
            <Link href="/seven" className="hover:text-[#f8fafc]" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
            <ChevronRight size={14} />
            <span style={{ color: '#f8fafc' }}>Simagic</span>
          </div>
          
          <h1 className="font-display" style={{ fontSize: '3rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '2px', textTransform: 'uppercase', margin: 0 }}>
            SIMAGIC
          </h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '24px' }}>
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>Ordenar por:</span>
            <select style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(249,115,22,0.5)', color: '#f8fafc', padding: '8px 16px', borderRadius: '8px', fontSize: '0.9rem', outline: 'none', cursor: 'pointer' }}>
              <option>Destaque</option>
              <option>Menor Preço</option>
              <option>Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Layout: Sidebar + Grid */}
        <div style={{ display: 'flex', gap: '32px', alignItems: 'flex-start' }}>
          
          {/* Sidebar de Filtros */}
          <aside style={{ width: '260px', flexShrink: 0, display: 'none', '@media(min-width: 768px)': { display: 'block' } } as any}>
            <div style={{ borderBottom: '2px solid #1e293b', paddingBottom: '12px', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '1px' }}>FILTRAR MAIS</h3>
            </div>
            
            {/* Categorias */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Categorias</h4>
                <span style={{ color: '#f8fafc', fontWeight: 800 }}>+</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href={currentMarca ? `/seven/produtos?marca=${currentMarca}` : `/seven/produtos`} style={{ textDecoration: 'none' }}>
                  <FilterCheckbox label="Todas as categorias" checked={!currentCategory} />
                </Link>
                {categories.map(cat => (
                  <Link key={cat.id} href={currentMarca ? `/seven/produtos?categoria=${cat.slug}&marca=${currentMarca}` : `/seven/produtos?categoria=${cat.slug}`} style={{ textDecoration: 'none' }}>
                    <FilterCheckbox label={cat.name} checked={currentCategory === cat.slug} />
                  </Link>
                ))}
              </div>
            </div>

            {/* Preço */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Preço</h4>
                <span style={{ color: '#f8fafc', fontWeight: 800 }}>+</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <FilterCheckbox label="Até R$ 1.662,89" />
                <FilterCheckbox label="De R$ 1.662,90 à R$ 3.029,89" />
                <FilterCheckbox label="De R$ 3.029,90 à R$ 4.396,89" />
                <FilterCheckbox label="De R$ 4.396,90 à R$ 5.763,89" />
                <FilterCheckbox label="De R$ 5.763,90 à R$ 7.130,89" />
                <FilterCheckbox label="Acima de R$ 8.500,00" />
              </div>
            </div>

            {/* Marcas */}
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>Marcas</h4>
                <span style={{ color: '#f8fafc', fontWeight: 800 }}>+</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link href={currentCategory ? `/seven/produtos?categoria=${currentCategory}` : `/seven/produtos`} style={{ textDecoration: 'none' }}>
                  <FilterCheckbox label="Todas as Marcas" checked={!currentMarca} />
                </Link>
                <Link href={currentCategory ? `/seven/produtos?categoria=${currentCategory}&marca=simagic` : `/seven/produtos?marca=simagic`} style={{ textDecoration: 'none' }}>
                  <FilterCheckbox label="Simagic" checked={currentMarca?.toLowerCase() === 'simagic'} />
                </Link>
                <Link href={currentCategory ? `/seven/produtos?categoria=${currentCategory}&marca=thermaltake` : `/seven/produtos?marca=thermaltake`} style={{ textDecoration: 'none' }}>
                  <FilterCheckbox label="Thermaltake" checked={currentMarca?.toLowerCase() === 'thermaltake'} />
                </Link>
              </div>
            </div>

            {/* Filtrar Botão */}
            <button style={{ width: '100%', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(234,88,12,0.3)' }} className="hover:scale-[1.02] transition-transform">
              FILTRAR
            </button>
          </aside>

          {/* Grade de Produtos */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {displayProducts.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                Nenhum produto encontrado.
              </div>
            ) : displayProducts.map(product => {
              const mainImage = product.images?.[0] || 'https://placehold.co/400x400/141416/f97316?text=Sem+Foto'
              const pricePix = product.price * 0.9 // Simulando 10% pix
              return (
                <Link key={product.id} href={`/seven/produtos/${product.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(20,20,22,0.6)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s', height: '100%' }} className="hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] group">
                    {/* Imagem */}
                    <div style={{ height: '220px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                      <img src={mainImage} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    
                    {/* Infos */}
                    <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '38px' }}>
                        {product.title}
                      </h3>
                      
                      {/* Estrelas */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f97316', marginBottom: '16px' }}>
                        <Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" /><Star size={12} fill="currentColor" />
                      </div>
                      
                      {/* Preços */}
                      <div style={{ marginTop: 'auto' }}>
                        <div style={{ color: '#94a3b8', fontSize: '1rem', textDecoration: 'none' }}>
                          R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: '8px' }}>
                          ou <strong>10x de R$ {(product.price / 10).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ color: '#22c55e', fontWeight: 900, fontSize: '1.4rem' }}>
                            <span style={{ fontSize: '1rem', marginRight: '2px' }}>R$</span>
                            {pricePix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                          <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>no pix</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

        </div>
      </Container>
    </div>
  )
}

function FilterCheckbox({ label, count, checked = false }: { label: string, count?: number, checked?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} className="group">
      {checked ? (
        <CheckSquare size={16} color="#ea580c" />
      ) : (
        <Square size={16} color="#64748b" className="group-hover:text-[#94a3b8]" />
      )}
      <span style={{ color: checked ? '#f8fafc' : '#94a3b8', fontSize: '0.85rem', fontWeight: checked ? 600 : 400, flex: 1 }} className="group-hover:text-[#f8fafc]">
        {label}
      </span>
      {count !== undefined && (
        <span style={{ color: '#64748b', fontSize: '0.75rem' }}>({count})</span>
      )}
    </div>
  )
}
