import { Container } from '@kings/ui'
import { createServerSupabaseClient } from '@kings/db'
import { formatPrice } from '@kings/utils'
import Link from 'next/link'
import Image from 'next/image'
import { ConsultoriaTabs } from './ConsultoriaTabs'

export const revalidate = 60

export default async function ConsultoriaPage() {
  let products: any[] = []
  
  try {
    const supabase = await createServerSupabaseClient()
    const { data } = await supabase
      .from('products')
      .select('id, title, slug, price, price_compare, images, attributes, stock')
      .eq('status', 'active')
      .ilike('title', '%consultoria%')
      .order('created_at', { ascending: false })
    
    products = data || []
  } catch (err) {
    console.error("Erro buscando produtos de consultoria:", err)
  }

  return (
    <div style={{ padding: '40px 0', minHeight: 'calc(100vh - 80px)' }}>
      <Container>
        <div style={{ marginBottom: '40px' }}>
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 16px 0', color: 'var(--text-primary)' }}>
            CONSULTORIA
          </h1>
          <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: 'var(--radius)', border: '1px solid var(--border)', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
            <p style={{ margin: '0 0 16px 0' }}>
              <strong>Consultoria Completa para Montagem e Otimização de Simuladores</strong>
            </p>
            <p style={{ margin: '0 0 16px 0' }}>
              Oferecemos consultoria especializada para montagem e ajustes de simuladores de corrida e jogos. Nosso serviço cobre tudo que você precisa para uma experiência imersiva e confortável, incluindo:
            </p>
            <ul style={{ margin: '0 0 16px 0', paddingLeft: '20px' }}>
              <li>Configuração de botões e controles</li>
              <li>Ajuste de telas e distanciamento ideal</li>
              <li>Postura correta para maior conforto e rendimento</li>
              <li>Configuração de 3 telas ou mais</li>
              <li>Personalização de setups para diferentes tipos de simuladores</li>
            </ul>
            <p style={{ margin: '0 0 16px 0' }}>
              Seja para uso profissional ou hobby, ajudamos você a criar o ambiente perfeito com orientação de especialistas. Garanta o máximo desempenho e imersão com nossa consultoria completa!
            </p>
            
            <div style={{ background: 'rgba(0, 229, 255, 0.05)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid var(--accent)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
              <div style={{ fontSize: '2rem' }}>🎟️</div>
              <div>
                <strong style={{ fontSize: '1.05rem', color: 'var(--success)' }}>R$ 150 revertidos em cupom!</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                  Atenção: O valor investido na consultoria (R$ 150) será 100% revertido em um cupom de desconto para você utilizar em sua própria compra de equipamentos na loja.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <ConsultoriaTabs products={products} />
        </div>
      </Container>
    </div>
  )
}
