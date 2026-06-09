/**
 * Configuração central do sistema de QA — KingsHub
 * Não contém chaves reais. Usa variáveis de ambiente carregadas pelo playwright.config.ts
 */

export const ENVS = {
  dev: 'http://localhost:3000',
  staging: 'https://staging.kingssimuladores.com.br',
  prod: 'https://www.kingssimuladores.com.br',
} as const

export const BASE_URL = process.env.BASE_URL ?? ENVS.prod

export const TIMEOUTS = {
  short: 5_000,
  medium: 15_000,
  long: 30_000,
  payment: 60_000,
} as const

// Seletores críticos mapeados para evitar duplicação nos testes
export const SELECTORS = {
  // Checkout
  btnFinalizarCompra: 'text=Finalizar Compra',
  btnPagarPix: 'text=Pagar com Pix',
  btnPagarCartao: 'text=Cartão ou Boleto',
  inputNome: 'input[name="nome"], input[placeholder*="nome" i], input[id*="nome" i]',
  inputEmail: 'input[type="email"], input[name="email"]',
  inputCpf: 'input[name="cpf"], input[placeholder*="CPF" i], input[id*="cpf" i]',
  inputTelefone: 'input[name="telefone"], input[placeholder*="telefone" i], input[id*="telefone" i]',
  inputCep: 'input[name="cep"], input[placeholder*="CEP" i], input[id*="cep" i]',
  // Links de produto (rota: /produtos/[slug])
  productLink: 'a[href*="/produtos/"]',
  // Carrinho
  btnAddToCart: 'text=Adicionar ao Carrinho, button[aria-label*="carrinho" i]',
  cartCount: '[data-testid="cart-count"], .cart-count',
  // Auth
  btnLogin: 'text=Entrar, text=Login',
  btnRegister: 'text=Criar Conta, text=Cadastrar',
  inputPassword: 'input[type="password"]',
} as const

// Dados de teste do Mercado Pago (Sandbox oficial)
export const MP_TEST_CARDS = {
  approved: {
    number: '5031 4332 1540 6351',
    cvv: '123',
    expiry: '11/25',
    holder: 'APRO',
    cpf: '12345678909',
  },
  rejected: {
    number: '5031 4332 1540 6351',
    cvv: '123',
    expiry: '11/25',
    holder: 'OTHE',
    cpf: '12345678909',
  },
  visa_approved: {
    number: '4235 6477 2802 5682',
    cvv: '123',
    expiry: '11/25',
    holder: 'APRO',
    cpf: '12345678909',
  },
} as const

// Dados fictícios reutilizáveis nos testes de checkout
export const TEST_CUSTOMER = {
  nome: 'João Teste QA',
  email: 'qa-test@kingssimuladores.com.br',
  cpf: '123.456.789-09',
  telefone: '(11) 99999-8888',
  cep: '01310-100',
} as const

// Mapa de fluxos críticos por prioridade
export const FLOW_PRIORITY = {
  P0: ['guest-checkout', 'logged-user-checkout', 'pix-discount', 'coupon-flow'],
  P1: ['guest-register', 'product-navigation', 'cart-upsell'],
  P2: ['admin-panel', 'msu-listing'],
} as const
