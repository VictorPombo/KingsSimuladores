import { Container, ProductCard, Badge } from '@kings/ui'

// Mock de dados para mostrar no catálogo
const MOCK_PRODUCTS = [
  { id: '1', title: 'Cockpit P1 PRO Extreme', price: 4599.90, imageUrl: 'https://placehold.co/400x400/131928/e8ecf4?text=Cockpit+P1', brand: 'XTREME RACING', isNew: true, discount: 5 },
  { id: '2', title: 'Volante Fanatec DD Pro', price: 7999.00, imageUrl: 'https://placehold.co/400x400/131928/e8ecf4?text=Fanatec+DD', brand: 'FANATEC', installments: 10 },
  { id: '3', title: 'Pedais Load Cell V3', price: 3499.00, imageUrl: 'https://placehold.co/400x400/131928/e8ecf4?text=Pedais+V3', brand: 'FANATEC' },
  { id: '4', title: 'Base Moza R9 Direct Drive', price: 5499.00, imageUrl: 'https://placehold.co/400x400/131928/e8ecf4?text=Moza+R9', brand: 'MOZA RACING', isNew: true },
  { id: '5', title: 'Câmbio H-Shifter TH8A', price: 1899.90, imageUrl: 'https://placehold.co/400x400/131928/e8ecf4?text=TH8A', brand: 'THRUSTMASTER', discount: 10 },
  { id: '6', title: 'Cockpit SXT V2', price: 2199.00, imageUrl: 'https://placehold.co/400x400/131928/e8ecf4?text=Cockpit+SXT', brand: 'XTREME RACING' },
]

export default function ProductsPage() {
  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', borderBottom: '1px solid var(--border)', paddingBottom: '16px' }}>
          <div>
            <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 800, margin: 0 }}>CATÁLOGO</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>Mostrando {MOCK_PRODUCTS.length} produtos encontrados</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Badge variant="warning">MOCK DATA</Badge>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 3fr', gap: '32px' }}>
          {/* Sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>Filtros</h3>
              
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Categorias</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Cockpits</label></li>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Volantes</label></li>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Pedais</label></li>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Acessórios</label></li>
                </ul>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Marcas</h4>
                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Xtreme Racing</label></li>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Fanatec</label></li>
                  <li><label style={{ display: 'flex', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}><input type="checkbox" /> Moza Racing</label></li>
                </ul>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <main>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
              {MOCK_PRODUCTS.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </main>
        </div>
      </Container>
    </div>
  )
}
