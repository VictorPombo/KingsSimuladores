import { Container } from '@kings/ui'
import React from 'react'
import { DalesteVideoPlayer } from '@/components/store/about/DalesteVideoPlayer'

export const metadata = {
  title: 'Quem Somos | Kings Simuladores',
  description: 'Conheça a história de Fernando Albertoni (Daleste) e a Kings Simuladores.',
}

export default function QuemSomosPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '30px 0' }}>
      <Container>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <img 
              src="/daleste.png" 
              alt="Fernando Albertoni - Daleste" 
              style={{ 
                width: '64px', 
                height: '64px', 
                borderRadius: '50%', 
                objectFit: 'cover',
                border: '2px solid var(--success)'
              }} 
            />
            <div>
              <h1 className="font-display" style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px 0', lineHeight: 1 }}>
                A Nossa História
              </h1>
              <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>
                Por Fernando Albertoni (Daleste)
              </p>
            </div>
          </div>

          {/* Vídeo Nativo com Controles Client-Side */}
          <DalesteVideoPlayer />

          <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            <p style={{ marginBottom: '32px' }}>
              Nossa história começa com a paixão pelo automobilismo virtual. A Kings Simuladores nasceu do sonho de trazer o que há de melhor em equipamentos e tecnologia para o ecossistema brasileiro de simuladores.
            </p>
            
            {/* MISSÃO & VISÃO */}
            <div style={{ marginBottom: '32px' }}>
              <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                🎯 Missão & Visão
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🏁</span> Nossa Missão
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    Proporcionar a experiência de pilotagem mais realista e imersiva possível, entregando equipamentos de elite que transformam entusiastas em pilotos e simulação em realidade — sempre com excelência técnica e suporte especializado.
                  </p>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🔭</span> Nossa Visão
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.95rem' }}>
                    Ser a maior referência nacional em SimRacing de alto desempenho, reconhecida não apenas como uma loja, mas como o verdadeiro quartel-general do simulador profissional no Brasil.
                  </p>
                </div>
              </div>
            </div>

            {/* FUNDAMENTO */}
            <div style={{ marginBottom: '32px', background: 'rgba(255, 255, 255, 0.03)', padding: '24px', borderRadius: '12px', borderLeft: '4px solid var(--accent)' }}>
              <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✝️</span> Fundamento: Nossa Fé, Nossa Base
              </h2>
              <blockquote style={{ fontStyle: 'italic', color: 'var(--text-muted)', borderLeft: '2px solid var(--border)', paddingLeft: '16px', margin: '0 0 16px 0' }}>
                &quot;Tudo o que fizerem, façam de todo o coração, como para o Senhor, e não para os homens.&quot; <br/>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>— Colossenses 3:23</strong>
              </blockquote>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                A Kings Simuladores é fundada sobre valores cristãos. Reconhecemos que todo crescimento, toda oportunidade e todo talento provêm de Deus. Trabalhamos com alegria e gratidão, submetendo nossos planos à vontade divina — porque acreditamos que servir ao cliente é, acima de tudo, uma forma de servir ao próximo.
              </p>
            </div>

            {/* VALORES */}
            <div style={{ marginBottom: '32px' }}>
              <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                💎 Nossos Valores
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {[
                  { icon: '🔍', title: 'Verdade & Integridade', text: 'Acreditamos que "a verdade sempre prevalece". Nossas negociações são transparentes, sem ilusões, baseadas na palavra empenhada e na justiça. Não vendemos o que você não precisa — vendemos o que vai te fazer evoluir.', ref: '"O que é torto não pode ser endireitado; o que falta não pode ser contado." — Eclesiastes 1:15' },
                  { icon: '🙏', title: 'Serviço como Ministério', text: 'Enxergamos nosso trabalho como uma oportunidade de servir ao próximo. Cada suporte técnico e cada venda é uma forma de expressar cuidado e respeito pelo sonho do cliente.', ref: '"Sirvam uns aos outros com amor." — Gálatas 5:13' },
                  { icon: '⚡', title: 'Excelência & Mordomia', text: 'Buscamos o mais alto nível de performance técnica. Entendemos que nossos talentos e recursos são dons que devem ser administrados com dedicação e aprimoramento constante. Se não está perfeito, não está pronto.', ref: '"Ao fiel mordomo, muito mais será dado." — Lucas 19:17' },
                  { icon: '❤️', title: 'Família & Comunidade', text: 'Valorizamos os laços que unem as pessoas. Promovemos um ambiente de simulação que fortalece a amizade e o respeito mútuo, refletindo o amor cristão em nossa comunidade de pilotos.', ref: '"Amai-vos uns aos outros." — João 13:34' },
                  { icon: '🙌', title: 'Soberania de Deus', text: 'Reconhecemos que todo crescimento e toda oportunidade provêm do Senhor. Trabalhamos com alegria e gratidão, submetendo nossos planos à vontade divina.', ref: '"Entrega o teu caminho ao Senhor; confia nele, e ele tudo fará." — Salmos 37:5' },
                  { icon: '🏆', title: 'Legado', text: 'Não trabalhamos apenas para o presente. Queremos construir algo que inspire a próxima geração de pilotos brasileiros — dentro e fora das pistas — deixando um legado de excelência, fé e propósito.', ref: '"Uma boa herança é deixada pelos pais para os filhos." — Provérbios 13:22' }
                ].map((val, idx) => (
                  <div key={idx} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{val.icon}</span> {val.title}
                    </h3>
                    <p style={{ margin: '0 0 12px 0', fontSize: '0.9rem', lineHeight: 1.6 }}>{val.text}</p>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>{val.ref}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* DISTRIBUIDORES OFICIAIS */}
            <div style={{ marginBottom: '32px' }}>
              <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                🏆 Distribuidores Oficiais
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {[
                  { name: 'Moza Racing', desc: 'Direct Drive & periféricos de alto desempenho' },
                  { name: 'Thermaltake', desc: 'Cockpits GR500, G6 e acessórios premium' },
                  { name: 'Simagic', desc: 'Bases e volantes de simulação profissional' }
                ].map((dist, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{dist.name}</h3>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{dist.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* QUEM JÁ ATENDEMOS */}
            <div style={{ marginBottom: '32px' }}>
              <h2 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                🤝 Quem Já Atendemos
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
                {[
                  { name: 'Tony Kanaan', role: 'Piloto Profissional', emoji: '🏎️' },
                  { name: 'Cerol da Fluxo', role: 'Influencer / Creator', emoji: '🎬' },
                  { name: 'Brasil Game Show', role: 'Evento Oficial', emoji: '🎮' },
                  { name: 'Hotel Tauá — SP', role: 'Parceiro Corporativo', emoji: '🏨' },
                  { name: 'Resort Morro dos Anjos', role: 'Parceiro Corporativo', emoji: '🏔️' },
                ].map((client, idx) => (
                  <div key={idx} style={{
                    background: 'rgba(255,255,255,0.03)', padding: '20px',
                    borderRadius: '12px', border: '1px solid var(--border)',
                    textAlign: 'center', transition: 'border-color 0.2s',
                  }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{client.emoji}</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{client.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{client.role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '32px', borderTop: '1px solid var(--border)', textAlign: 'center', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
              <p>
                Hoje, somos a grande referência nacional quando o assunto é qualidade, imersão e performance.
              </p>
              <p style={{ fontWeight: 800, color: 'var(--accent)', marginTop: '8px' }}>
                Seja bem-vindo à família Kings Simuladores!
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
