import { Container } from '@kings/ui'

export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        padding: '40px 0',
        background: 'transparent',
        color: 'var(--text-muted)',
      }}
      id="site-footer"
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px 16px;
          margin-bottom: 24px;
        }
        .footer-grid h4 {
          font-size: 0.75rem !important;
          margin-bottom: 10px !important;
        }
        .footer-grid li, .footer-grid p, .footer-grid a {
          font-size: 0.78rem !important;
        }
        .footer-grid > div:first-child {
          grid-column: 1 / -1;
        }
        @media (min-width: 768px) {
          .footer-grid {
            grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr;
            gap: 24px;
            margin-bottom: 32px;
          }
          .footer-grid h4 {
            font-size: 0.85rem !important;
            margin-bottom: 16px !important;
          }
          .footer-grid li, .footer-grid p, .footer-grid a {
            font-size: 0.8rem !important;
          }
          .footer-grid > div:first-child {
            grid-column: auto;
          }
        }
        .footer-bottom {
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          text-align: center;
          gap: 12px;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          font-size: 0.72rem;
        }
        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: space-between;
            text-align: left;
            gap: 24px;
            font-size: 0.78rem;
          }
        }
      ` }} />
      <Container>
        <div className="footer-grid">
          <div>
            <img 
              src="https://cdn.awsli.com.br/1940/1940182/logo/logo_novo_kings_-removebg-preview-1-ireduuhg5i.png" 
              alt="Kings Simuladores" 
              style={{ height: '65px', display: 'block', objectFit: 'contain', marginBottom: '16px' }}
            />
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              A melhor e maior loja de simuladores de corrida do Brasil. Tudo para o seu cockpit.
            </p>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Navegação</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="/produtos" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Todos os Produtos</a></li>
              <li><a href="/categorias/cockpits" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Cockpits</a></li>
              <li><a href="/categorias/volantes" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Volantes</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Institucional</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="https://www.kingssimuladores.com.br/pagina/quem-somos.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Quem Somos</a></li>
              <li><a href="https://www.kingssimuladores.com.br/pagina/politica-de-trocas-e-devolucoes.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Trocas e Devoluções</a></li>
              <li><a href="https://www.kingssimuladores.com.br/pagina/politica-de-privacidade.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Política de Privacidade</a></li>
              <li><a href="https://www.kingssimuladores.com.br/pagina/meios-de-pagamento-e-de-frete.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Pagamento e Frete</a></li>
              <li><a href="https://www.kingssimuladores.com.br/pagina/divulgue-na-kings.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textDecoration: 'none' }}>Divulgue na Kings</a></li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Atendimento</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ fontSize: '0.85rem' }}>
                <a href="https://wa.me/5511959018725" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>WhatsApp: (11) 95901-8725</a>
              </li>
              <li style={{ fontSize: '0.85rem' }}>
                <a href="mailto:contato@kingssimuladores.com.br" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>contato@kingssimuladores.com.br</a>
              </li>
              <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>KINGS SIMULADORES - CNPJ: 29.688.089/0001-02</li>
            </ul>
          </div>
          <div className="security-col">
            <h4 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Transparência e Segurança</h4>
            <style dangerouslySetInnerHTML={{__html: `
              .security-col { grid-column: 1 / -1; }
              @media (min-width: 768px) { .security-col { grid-column: auto; } }

              .security-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 6px;
              }
              .security-badge {
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 6px;
                border-radius: 4px;
                min-width: 0;
                overflow: hidden;
              }
              .security-badge svg { flex-shrink: 0; width: 16px; height: 16px; }
              .security-badge .badge-label { font-size: 0.55rem !important; line-height: 1; }
              .security-badge .badge-value { font-size: 0.6rem !important; font-weight: bold; }
              @media (min-width: 768px) {
                .security-grid { 
                  display: flex;
                  flex-direction: column;
                  gap: 10px; 
                }
                .security-badge { padding: 8px; gap: 6px; }
                .security-badge svg { width: 20px; height: 20px; }
                .security-badge .badge-label { font-size: 0.65rem !important; }
                .security-badge .badge-value { font-size: 0.75rem !important; }
              }
            `}} />
            <div className="security-grid">
              <div className="security-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#2ecc71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span className="badge-label" style={{ color: 'var(--text-muted)' }}>Blindado</span>
                  <span className="badge-value" style={{ color: 'var(--text-primary)' }}>100% Seguro</span>
                </div>
              </div>
              <div className="security-badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="#f1c40f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <span className="badge-label" style={{ color: 'var(--text-muted)' }}>Certificado</span>
                  <span className="badge-value" style={{ color: 'var(--text-primary)' }}>SSL Seguro</span>
                </div>
              </div>
              <a href="https://www.reclameaqui.com.br/empresa/kings-simuladores/" target="_blank" rel="noopener noreferrer" className="security-badge" style={{ backgroundColor: '#fff', textDecoration: 'none', border: 'none', justifyContent: 'center' }}>
                <span className="badge-value" style={{ color: '#2ecc71', fontStyle: 'italic' }}>Reclame</span>
                <span className="badge-value" style={{ color: '#333', fontStyle: 'italic' }}>AQUI</span>
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div>
            Kings Simuladores © {new Date().getFullYear()} — Todos os direitos reservados.
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <a href="https://instagram.com/kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textDecoration: 'none' }}>Instagram</a>
            <a href="https://facebook.com/kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textDecoration: 'none' }}>Facebook</a>
            <a href="https://www.youtube.com/@kingssimuladores" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', textDecoration: 'none' }}>YouTube</a>
          </div>
        </div>
      </Container>
    </footer>
  )
}
