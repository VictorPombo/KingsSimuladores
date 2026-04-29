import { Container } from '@kings/ui'
import { ChevronRight, Star, ShoppingCart, CheckSquare, Square } from 'lucide-react'
import Link from 'next/link'

// Mock Data baseado no screenshot
const MOCK_PRODUCTS = [
  {
    id: '1',
    title: 'Volante Simagic NEO X 330T - GT',
    price: 4399.90,
    pricePix: 3959.91,
    installments: '10x de R$ 439,99',
    image: 'https://placehold.co/400x400/141416/f97316?text=Simagic+NEO+X',
    rating: 5,
    reviews: 0
  },
  {
    id: '2',
    title: 'Simagic MagLink Adaptador (Para Bases não Simagic)',
    price: 440.00,
    pricePix: 396.00,
    installments: '10x de R$ 44,00',
    image: 'https://placehold.co/400x400/141416/f97316?text=MagLink',
    rating: 5,
    reviews: 0
  },
  {
    id: '3',
    title: 'Pedal Simagic P500 Dual Pedal',
    price: 2600.00,
    pricePix: 2340.00,
    installments: '10x de R$ 260,00',
    image: 'https://placehold.co/400x400/141416/f97316?text=Pedal+P500',
    rating: 5,
    reviews: 0
  },
  {
    id: '4',
    title: 'Pedal Simagic (DUPLO) P2000-S200RF',
    price: 7700.00,
    pricePix: 6930.00,
    installments: '10x de R$ 770,00',
    image: 'https://placehold.co/400x400/141416/f97316?text=Pedal+P2000',
    rating: 5,
    reviews: 0
  }
]

export default function SevenProductsPage() {
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
                <FilterCheckbox label="Acessórios e Periféricos" count={12} />
                <FilterCheckbox label="Base" count={2} />
                <FilterCheckbox label="Iniciante" count={8} />
                <FilterCheckbox label="Intermediário" count={7} />
                <FilterCheckbox label="NOVIDADES" count={3} checked />
                <FilterCheckbox label="Pedal" count={5} />
                <FilterCheckbox label="Profissional" count={7} />
                <FilterCheckbox label="Qual o seu perfil?" count={12} />
                <FilterCheckbox label="Simagic" count={23} checked />
                <FilterCheckbox label="Simuladores/Cockpits" count={2} />
                <FilterCheckbox label="Volante" count={5} />
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
                <FilterCheckbox label="SIMAGIC" count={23} checked />
              </div>
            </div>

            {/* Filtrar Botão */}
            <button style={{ width: '100%', background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)', color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(234,88,12,0.3)' }} className="hover:scale-[1.02] transition-transform">
              FILTRAR
            </button>
          </aside>

          {/* Grade de Produtos */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
            {MOCK_PRODUCTS.map(product => (
              <div key={product.id} style={{ background: 'rgba(20,20,22,0.6)', backdropFilter: 'blur(12px)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s, box-shadow 0.3s' }} className="hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.15)] group">
                {/* Imagem (Fundo branco/cinza claro estilo o print original, adaptado pro Dark Mode com um radial gradient) */}
                <div style={{ height: '220px', background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(0,0,0,0) 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
                  <img src={product.image} alt={product.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
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
                      ou <strong>{product.installments}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ color: '#22c55e', fontWeight: 900, fontSize: '1.4rem' }}>
                        <span style={{ fontSize: '1rem', marginRight: '2px' }}>R$</span>
                        {product.pricePix.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <span style={{ color: '#22c55e', fontSize: '0.7rem', fontWeight: 600 }}>no pix</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
