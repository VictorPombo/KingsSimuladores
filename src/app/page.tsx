import ParticleCanvas from "@/components/canvas/ParticleCanvas";

// Mock implementation for Supabase Server Component data fetching
async function getProducts() {
  // Try to create mock products to emulate supabase response
  return [
    {
      id: 1,
      brand: "Moza Racing",
      name: "Base Direct Drive 9nm R9 v3",
      rating: 4.9,
      price: 4500,
      oldPrice: 4800,
      tag: "-6%",
      emoji: "🎮",
    },
    {
      id: 2,
      brand: "CR Cockpits",
      name: "Cockpit CR4 Pro · Alumínio Racing",
      rating: 5.0,
      price: 15000,
      oldPrice: 16000,
      tag: "Destaque",
      emoji: "🏁",
    },
    {
      id: 3,
      brand: "Moza Racing",
      name: "Câmbio HGP · 7 Velocidades",
      rating: 4.7,
      price: 1465,
      oldPrice: null,
      tag: null,
      emoji: "⚙️",
    },
    {
      id: 4,
      brand: "Moza Racing",
      name: "Botão Emergencial E-Stop",
      rating: 4.8,
      price: 500,
      oldPrice: null,
      tag: "Novo",
      emoji: "🛑",
    },
    {
      id: 5,
      brand: "CR Motion",
      name: "Cockpit Motion · Sistema Profissional",
      rating: 5.0,
      price: 120000,
      oldPrice: null,
      tag: "Motion",
      emoji: "🏎️",
    },
    {
      id: 6,
      brand: "Rockets Sim",
      name: "Pedais Load Cell · 3 Pedais",
      rating: 4.6,
      price: 2200,
      oldPrice: null,
      tag: "Popular",
      emoji: "👟",
    },
  ];
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="relative w-full overflow-hidden bg-[var(--bg)] text-[var(--text)] font-[family-name:var(--font-dm)]">
      {/* 3D Canvas Background */}
      <ParticleCanvas />

      {/* Noise overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none opacity-50 mix-blend-screen bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.04\'/%3E%3C/svg%3E')]" />
      
      {/* Scanlines overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(125,211,252,.008) 3px,rgba(125,211,252,.008) 4px)" }} />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] px-12 py-5 flex items-center justify-between bg-gradient-to-b from-[#04060b]/90 to-transparent border-b border-[var(--blue-b)] backdrop-blur-none">
        <div className="font-[family-name:var(--font-bebas)] text-[28px] tracking-[4px] text-white flex items-center gap-2.5">
          <span className="text-[20px] drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]">👑</span>
          KINGS
        </div>
        <div className="flex gap-8 items-center hidden md:flex">
          {["Simuladores", "Cockpits", "Periféricos", "Usados", "Sobre"].map((item) => (
            <a key={item} href="#" className="text-[12px] text-[var(--muted2)] no-underline tracking-[0.12em] uppercase font-light transition-colors duration-300 hover:text-[var(--blue)]">
              {item}
            </a>
          ))}
        </div>
        <button className="bg-transparent border border-[var(--blue-b)] text-[var(--blue)] text-[11px] tracking-[0.15em] uppercase px-[22px] py-[10px] rounded-[2px] cursor-pointer transition-all duration-300 relative overflow-hidden group hover:shadow-[0_0_20px_rgba(125,211,252,0.2)] font-[family-name:var(--font-dm)]">
          <span className="absolute inset-0 bg-[var(--blue-glow)] origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100" />
          <span className="relative z-10">Entrar na Loja →</span>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen grid grid-cols-1 lg:grid-cols-2 items-center px-6 lg:px-[72px] pt-[120px] pb-[80px] overflow-hidden">
        <div className="light-streaks absolute inset-0 pointer-events-none overflow-hidden">
          <div className="streak left-[15%] h-[60%] delay-[0s] opacity-15" />
          <div className="streak left-[28%] h-[80%] delay-[0.8s] opacity-10" />
          <div className="streak left-[42%] h-[50%] delay-[1.6s] opacity-12" />
          <div className="streak left-[60%] h-[90%] delay-[0.4s] opacity-[0.08]" />
          <div className="streak left-[72%] h-[70%] delay-[2s] opacity-14" />
          <div className="streak left-[85%] h-[55%] delay-[1.2s] opacity-10" />
          <div className="streak left-[35%] h-[40%] delay-[2.8s] opacity-[0.07]" />
          <div className="streak left-[55%] h-[85%] delay-[3.2s] opacity-[0.09]" />
        </div>
        
        <div className="hero-glow" />

        <div className="relative z-[2]">
          <div className="inline-flex items-center gap-2.5 mb-7 animate-fadeup animation-delay-[300ms]">
            <div className="w-1.5 h-1.5 bg-[var(--blue)] rounded-full shadow-[0_0_8px_var(--blue)] hero-eyebrow-dot" />
            <span className="font-[family-name:var(--font-jetbrains)] text-[11px] text-[var(--blue-dim)] tracking-[0.18em] uppercase">
              O Rei dos Simuladores — Brasil
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-bebas)] text-[clamp(72px,10vw,130px)] leading-[0.88] tracking-[3px] mb-1.5 animate-fadeup animation-delay-[500ms]">
            <span className="block text-white" style={{ textShadow: "0 0 80px rgba(255,255,255,0.15)" }}>DOMINE</span>
            <span className="block bg-gradient-to-r from-[var(--blue)] via-[var(--blue-dim)] to-[var(--green)] text-transparent bg-clip-text drop-shadow-[0_0_30px_rgba(125,211,252,0.5)]">
              CADA CURVA
            </span>
          </h1>

          <p className="text-[15px] text-[var(--muted2)] font-light leading-[1.7] max-w-[420px] mb-11 animate-fadeup animation-delay-[700ms]">
            A plataforma de sim racing mais completa do Brasil. Simuladores novos, usados, setups profissionais e tudo que você precisa para ser o mais rápido.
          </p>

          <div className="flex gap-4 items-center animate-fadeup animation-delay-[900ms]">
            <button className="bg-[var(--blue-deep)] text-white text-[13px] tracking-[0.12em] uppercase px-9 py-4 border-none rounded-[2px] cursor-pointer font-medium relative overflow-hidden transition-all duration-300 shadow-[0_0_40px_rgba(14,165,233,.3)] hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(14,165,233,.5)]">
              Ver Simuladores →
              <span className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            </button>
            <button className="bg-transparent border border-[var(--blue-b)] text-[var(--muted2)] text-[13px] tracking-[0.12em] uppercase px-9 py-4 rounded-[2px] cursor-pointer transition-all duration-300 hover:border-[var(--blue)] hover:text-[var(--blue)]">
              Marketplace Usados
            </button>
          </div>

          <div className="flex gap-10 mt-[60px] animate-fadeup animation-delay-[1100ms]">
            {[
              { num: "23", unit: "k", label: "Seguidores" },
              { num: "3.5", unit: "k+", label: "Pilotos equipados" },
              { num: "R$", unit: "92k", label: "Vendas/mês", preUnit: false },
            ].map((stat, i) => (
              <div key={i} className="stat">
                <div className="font-[family-name:var(--font-bebas)] text-[40px] text-white tracking-[2px] leading-none">
                  {stat.preUnit !== false && stat.num}
                  <span className="text-[var(--blue)]">{stat.unit}</span>
                  {stat.preUnit === false && stat.num}
                </div>
                <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.12em] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-[2] flex items-center justify-center animate-fadein animation-delay-[800ms] mt-16 lg:mt-0">
          <div className="relative w-full max-w-[560px] aspect-[4/3]">
            <div className="cockpit-glow-ring" />
            <div className="cockpit-glow-ring !w-[320px] !h-[320px] !border-[rgba(125,211,252,0.12)] animation-delay-[1s]" />
            <div className="cockpit-glow-ring !w-[220px] !h-[220px] !border-[rgba(125,211,252,0.18)] animation-delay-[2s]" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="text-[80px] drop-shadow-[0_0_40px_rgba(125,211,252,0.4)] animate-float">🏎️</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--blue)] tracking-[0.15em] uppercase bg-[var(--blue-glow)] border border-[var(--blue-b)] px-3.5 py-1.5 rounded-full">
                Cockpit CR4 Pro · Em estoque
              </div>
            </div>

            {/* Floating cards */}
            <div className="float-card top-[8%] -left-[5%] delay-[0s]">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-[var(--muted)] uppercase tracking-[0.12em] mb-1">Ticket médio</div>
              <div className="font-[family-name:var(--font-bebas)] text-[22px] text-white tracking-[1px]">R$<span className="text-[13px] text-[var(--blue)]">3.850</span></div>
              <div className="text-[10px] text-[var(--green)] mt-0.5">↑ Premium market</div>
            </div>
            <div className="float-card bottom-[12%] -right-[8%] delay-[1.5s]">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-[var(--muted)] uppercase tracking-[0.12em] mb-1">Frete para</div>
              <div className="font-[family-name:var(--font-bebas)] text-[22px] text-white tracking-[1px]"><span className="text-[13px] text-[var(--blue)]">Todo Brasil</span></div>
              <div className="text-[10px] text-[var(--green)] mt-0.5">→ Envio em 24h</div>
            </div>
            <div className="float-card top-[60%] -left-[10%] delay-[0.8s]">
              <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-[var(--muted)] uppercase tracking-[0.12em] mb-1">Parcelamento</div>
              <div className="font-[family-name:var(--font-bebas)] text-[22px] text-white tracking-[1px]">12<span className="text-[13px] text-[var(--blue)]">×</span></div>
              <div className="text-[10px] text-[var(--green)] mt-0.5">sem juros no cartão</div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 animate-fadeup animation-delay-[1500ms]">
          <div className="scroll-line w-[1px] h-[50px] bg-gradient-to-b from-[var(--blue)] to-transparent" />
          <span className="font-[family-name:var(--font-jetbrains)] text-[9px] text-[var(--muted)] tracking-[0.2em] uppercase">Scroll</span>
        </div>
      </section>

      {/* Categories Section */}
      <section className="relative z-10 px-6 lg:px-[72px] py-[100px]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-[32px] h-[1px] bg-[var(--blue)]" />
          <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--blue-dim)] tracking-[0.18em] uppercase">Categorias · 01</div>
        </div>
        <h2 className="font-[family-name:var(--font-bebas)] text-[clamp(52px,6vw,88px)] leading-[0.9] tracking-[2px] text-white mb-[60px]">
          EQUIPAMENTOS<br /><em className="not-italic text-transparent" style={{ WebkitTextStroke: "1px rgba(125,211,252,.3)" }}>PARA VENCER</em>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-[var(--blue-b)] border border-[var(--blue-b)]">
          {[
            { num: "01", icon: "🏁", name: "Cockpits", desc: "Da entrada ao professional motion. Estruturas que transformam qualquer setup num cockpit de verdade." },
            { num: "02", icon: "🎮", name: "Volantes", desc: "Moza Racing, Logitech G, câmbios e botões. Controle total na ponta dos dedos." },
            { num: "03", icon: "⚙️", name: "Bases DD", desc: "Direct Drive de alta performance. Force feedback que você sente como se estivesse no asfalto." },
            { num: "04", icon: "👟", name: "Pedais", desc: "Sensores de carga precisos. Dosagem milimétrica de freio para reduzir seus tempos." }
          ].map(cat => (
            <div key={cat.num} className="bg-[var(--bg)] p-8 cursor-pointer relative overflow-hidden transition-colors duration-300 flex flex-col group hover:bg-[rgba(125,211,252,0.04)]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--blue)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-center" />
              <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--muted)] tracking-[0.1em] mb-4">{cat.num}</div>
              <div className="text-[32px] mb-3.5 drop-shadow-[0_0_12px_rgba(125,211,252,0.4)]">{cat.icon}</div>
              <div className="font-[family-name:var(--font-bebas)] text-[26px] tracking-[1.5px] text-white mb-2">{cat.name}</div>
              <div className="text-[12px] text-[var(--muted2)] leading-[1.6] flex-1">{cat.desc}</div>
              <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--blue)] mt-5 flex items-center gap-1.5 before:content-['→'] before:text-[10px]">
                Ver todos
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Section */}
      <section className="relative z-10 px-6 lg:px-[72px] py-[80px] bg-gradient-to-br from-[rgba(14,165,233,0.04)] to-transparent border-y border-[var(--blue-b)] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-[family-name:var(--font-bebas)] text-[300px] tracking-[20px] text-transparent whitespace-nowrap pointer-events-none select-none" style={{ WebkitTextStroke: "1px rgba(125,211,252,0.04)" }}>
          KINGS
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center relative z-[1]">
          <div>
            <div className="inline-flex items-center gap-2 bg-[rgba(251,191,36,0.08)] border border-[rgba(251,191,36,0.2)] px-3.5 py-1.5 rounded-[3px] font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--gold)] tracking-[0.1em] uppercase mb-5">
              👑 Mais vendido — Abr/2026
            </div>
            <h2 className="font-[family-name:var(--font-bebas)] text-[clamp(48px,5.5vw,80px)] leading-[0.92] tracking-[2px] text-white mb-5">
              COCKPIT<br />CR4 PRO<br />MOTION
            </h2>
            <div className="flex gap-6 mb-9 flex-wrap">
              {["Sistema de movimento", "DD 9nm integrado", "iRacing / ACC / F1"].map(spec => (
                <div key={spec} className="flex items-center gap-1.5 text-[12px] text-[var(--muted2)]">
                  <div className="w-1 h-1 bg-[var(--blue)] rounded-full" />
                  <span>{spec}</span>
                </div>
              ))}
            </div>
            <div className="my-7">
              <div className="text-[11px] text-[var(--muted)] uppercase tracking-[0.1em] mb-1">A partir de</div>
              <div className="font-[family-name:var(--font-bebas)] text-[56px] text-[var(--blue)] tracking-[2px] leading-none">R$15.000</div>
              <div className="text-[12px] text-[var(--muted2)] mt-1">ou 12× de R$1.526 · Frete grátis</div>
            </div>
            <div className="flex gap-3.5">
              <button className="bg-[var(--blue-deep)] text-white text-[13px] tracking-[0.12em] uppercase px-9 py-4 border-none rounded-[2px] cursor-pointer font-medium relative transition-transform hover:-translate-y-0.5 hover:shadow-[0_0_60px_rgba(14,165,233,.5)] shadow-[0_0_40px_rgba(14,165,233,.3)]">Comprar Agora →</button>
              <button className="bg-transparent border border-[rgba(125,211,252,0.2)] text-[var(--muted2)] text-[13px] tracking-[0.12em] uppercase px-9 py-4 rounded-[2px] cursor-pointer transition-colors duration-300 hover:border-[var(--blue)] hover:text-[var(--blue)]">Ver Detalhes</button>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <div className="w-full aspect-square flex items-center justify-center relative">
              <div className="absolute inset-[20%] bg-[radial-gradient(circle,rgba(14,165,233,0.2)_0%,transparent_65%)] rounded-full animate-breathe" />
              <div className="text-[140px] relative z-[1] drop-shadow-[0_0_60px_rgba(125,211,252,0.4)] animate-float">🏎️</div>
              <div className="absolute -right-5 top-[20%] bg-[rgba(13,20,34,0.9)] border border-[var(--blue-b)] rounded-md px-3.5 py-2.5 backdrop-blur-[20px]">
                <div className="text-[9px] text-[var(--muted)] tracking-[0.1em] uppercase mb-1 font-[family-name:var(--font-jetbrains)]">Stock</div>
                <div className="text-[13px] text-[var(--green)] font-medium">✓ Disponível</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative z-10 px-6 lg:px-[72px] py-[100px]">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-[32px] h-[1px] bg-[var(--blue)]" />
          <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--blue-dim)] tracking-[0.18em] uppercase">Produtos · 02</div>
        </div>
        <h2 className="font-[family-name:var(--font-bebas)] text-[clamp(52px,6vw,88px)] leading-[0.9] tracking-[2px] text-white mb-[60px]">
          OS MELHORES<br /><em className="not-italic text-transparent" style={{ WebkitTextStroke: "1px rgba(125,211,252,.3)" }}>DO BRASIL</em>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map(prod => (
            <div key={prod.id} className="bg-[rgba(9,14,24,0.8)] border border-[rgba(125,211,252,0.07)] rounded-lg overflow-hidden cursor-pointer relative transition-all duration-400 group hover:border-[rgba(125,211,252,0.25)] hover:-translate-y-[6px] hover:shadow-[0_20px_60px_rgba(14,165,233,0.15)]">
              <div className="absolute inset-0 bg-gradient-to-br from-[rgba(125,211,252,0.04)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none" />
              <div className="bg-gradient-to-br from-[rgba(14,165,233,0.08)] to-[rgba(110,231,183,0.04)] p-10 flex items-center justify-center aspect-[4/3] relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,252,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                <span className="text-[64px] drop-shadow-[0_0_20px_rgba(125,211,252,0.3)] relative z-[1]">{prod.emoji}</span>
                {prod.tag && (
                  <div className="absolute top-3 left-3 bg-[rgba(251,191,36,0.1)] border border-[rgba(251,191,36,0.25)] font-[family-name:var(--font-jetbrains)] text-[9px] text-[var(--gold)] px-2 py-1 rounded-[3px] tracking-[0.08em] uppercase">
                    {prod.tag}
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="font-[family-name:var(--font-jetbrains)] text-[9px] text-[var(--blue-dim)] tracking-[0.14em] uppercase mb-1.5">{prod.brand}</div>
                <div className="text-[16px] text-white font-medium mb-2 leading-[1.3]">{prod.name}</div>
                <div className="flex items-center gap-1.5 mb-3.5">
                  <span className="text-[11px] text-[var(--gold)] tracking-[1px]">★{"★".repeat(Math.floor(prod.rating)-1)}{prod.rating % 1 > 0 ? "★" : "☆"}</span>
                  <span className="text-[11px] text-[var(--muted)]">({prod.rating.toFixed(1)})</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-[family-name:var(--font-bebas)] text-[28px] text-[var(--blue)] tracking-[1px] leading-none">
                      R${prod.price.toLocaleString('pt-BR')}
                    </div>
                    {prod.oldPrice && (
                      <div className="text-[11px] text-[var(--muted)] line-through mt-0.5">
                        R${prod.oldPrice.toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                  <button className="w-9 h-9 border border-[var(--blue-b)] rounded-full flex items-center justify-center text-[var(--blue)] text-[18px] cursor-pointer bg-transparent transition-all duration-300 hover:bg-[var(--blue-deep)] hover:border-[var(--blue-deep)] hover:text-white hover:shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace Banner */}
      <div className="relative z-10 mx-6 lg:mx-[72px] border border-[var(--blue-b)] rounded-xl overflow-hidden bg-gradient-to-br from-[rgba(110,231,183,0.06)] to-[rgba(125,211,252,0.04)] p-8 lg:p-16 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 items-center">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[var(--green)] to-transparent" />
        <div>
          <h3 className="font-[family-name:var(--font-bebas)] text-[52px] tracking-[2px] text-white mb-3 leading-[1]">
            MARKETPLACE<br /><span className="text-[var(--green)]">DE USADOS</span>
          </h3>
          <p className="text-[14px] text-[var(--muted2)] max-w-[480px] leading-[1.7]">
            Anuncie seu simulador usado ou encontre o equipamento que procura com preço justo. Comunidade Kings, plataforma confiável.
          </p>
        </div>
        <button className="bg-[var(--green)] text-[#04060b] text-[12px] tracking-[0.15em] uppercase px-8 py-4 border-none rounded-[3px] cursor-pointer font-[family-name:var(--font-dm)] font-semibold whitespace-nowrap transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(110,231,183,0.3)]">
          Acessar Marketplace →
        </button>
      </div>

      {/* Social Proof */}
      <section className="relative z-10 px-6 lg:px-[72px] py-[100px] grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-20 items-start">
        <div>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-[32px] h-[1px] bg-[var(--blue)]" />
            <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--blue-dim)] tracking-[0.18em] uppercase">Avaliações · 03</div>
          </div>
          <div className="font-[family-name:var(--font-bebas)] text-[120px] leading-[0.85] text-transparent tracking-[4px] mb-3" style={{ WebkitTextStroke: "1px rgba(125,211,252,0.3)" }}>4.9</div>
          <p className="text-[13px] text-[var(--muted2)] leading-[1.7]">
            Nota média de satisfação.<br />
            Mais de 3.500 pilotos equipados<br />
            em todo o Brasil.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-8 lg:mt-0">
          {[
            { text: `"Melhor investimento que fiz pro meu setup. Qualidade absurda e chegou antes do prazo em SP."`, author: "Carlos M.", product: "Cockpit CR4 Pro" },
            { text: `"Atendimento excelente. Tive dúvidas e me ajudaram a escolher a base certa pro meu nível."`, author: "Rafael S.", product: "Base DD Moza R9" },
            { text: `"Comprei no RS e veio em perfeito estado. Embalagem impecável, produto incrível."`, author: "Pedro A.", product: "Câmbio HGP" },
            { text: `"Tem o melhor preço do Brasil pra Moza. Já comprei 3 vezes e sempre top demais."`, author: "André L.", product: "Kings Simuladores" }
          ].map((review, i) => (
            <div key={i} className="bg-[rgba(9,14,24,0.8)] border border-[rgba(125,211,252,0.08)] rounded-lg p-5">
              <div className="text-[var(--gold)] text-[12px] tracking-[2px] mb-2.5">★★★★★</div>
              <p className="text-[13px] text-[var(--muted2)] leading-[1.7] mb-4 italic">{review.text}</p>
              <div className="text-[12px] text-[var(--blue-dim)] font-medium">{review.author}</div>
              <div className="text-[10px] text-[var(--muted)] font-[family-name:var(--font-jetbrains)] uppercase tracking-[0.1em]">{review.product}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[var(--blue-b)] px-6 lg:px-[72px] pt-[60px] pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-[60px] mb-[60px]">
          <div>
            <div className="font-[family-name:var(--font-bebas)] text-[32px] tracking-[4px] text-white mb-3">👑 KINGS</div>
            <p className="text-[13px] text-[var(--muted2)] leading-[1.7] max-w-[260px]">O maior ecossistema de sim racing do Brasil. Equipamentos novos, marketplace de usados e comunidade ativa.</p>
          </div>
          {[
            { title: "Loja", links: ["Cockpits", "Volantes", "Bases DD", "Pedais", "Câmbios"] },
            { title: "Marketplace", links: ["Anunciar Usado", "Comprar Usado", "Como Funciona", "Segurança"] },
            { title: "Suporte", links: ["WhatsApp", "Minha Conta", "Pedidos", "Trocas", "Contato"] }
          ].map(col => (
            <div key={col.title}>
              <div className="font-[family-name:var(--font-jetbrains)] text-[10px] text-[var(--blue)] tracking-[0.15em] uppercase mb-[18px]">{col.title}</div>
              <ul className="list-none p-0 m-0 flex flex-col gap-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-[13px] text-[var(--muted2)] no-underline transition-colors hover:text-[var(--text)]">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-[rgba(125,211,252,0.06)] pt-7 gap-4">
          <div className="text-[11px] text-[var(--muted)] font-[family-name:var(--font-jetbrains)]">© 2026 Kings Simuladores · Todos os direitos reservados</div>
          <div className="text-[10px] text-[var(--muted)] font-[family-name:var(--font-jetbrains)] sm:text-right leading-[1.8]">
            Kings Simuladores · CNPJ 29.688.089/0001-02<br />
            Sabrina Prado Albertoni Ltda · CNPJ 59.851.612/0001-30
          </div>
        </div>
      </footer>
    </main>
  );
}
