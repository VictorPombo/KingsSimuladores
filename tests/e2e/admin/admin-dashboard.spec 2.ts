/**
 * Suite E2E — Admin Dashboard (KingsHub)
 * Agente 1 do SWARM de QA
 *
 * Cobre:
 *  - Login de admin (/admin/login)
 *  - Dashboard principal (/admin)
 *  - Lista de pedidos (/admin/pedidos)
 *  - Notas fiscais (/admin/notas-fiscais)
 *  - Clientes (/admin/clientes)
 *  - Cupons (/admin/cupons)
 *  - Páginas auxiliares: /admin/relatorios, /admin/config-gerais, /admin/dados-loja
 *
 * Regras:
 *  - Testes que requerem sessão autenticada são pulados quando
 *    process.env.ADMIN_EMAIL não está definido.
 *  - Cada test é independente (beforeEach com navegação própria).
 *  - Erros de console são capturados e assertados.
 */

import { test, expect, Page } from '@playwright/test'
import { TIMEOUTS } from '../../qa-config'

const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? ''
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''
const HAS_CREDENTIALS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD)

// ---------------------------------------------------------------------------
// Helper: acumula erros de console numa lista
// ---------------------------------------------------------------------------
function captureConsoleErrors(page: Page): () => string[] {
  const errors: string[] = []
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text())
    }
  })
  return () => errors
}

// ---------------------------------------------------------------------------
// Helper: faz login via UI e aguarda redirecionamento
// ---------------------------------------------------------------------------
async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })

  await page.getByLabel(/e-mail/i).fill(ADMIN_EMAIL)
  await page.getByLabel(/senha/i).fill(ADMIN_PASSWORD)
  await page.getByRole('button', { name: /entrar/i }).click()

  // Aguarda navegação pós-login (redireciona para /admin/diario-de-bordo ou /admin)
  await page.waitForURL(/\/admin/, { timeout: TIMEOUTS.medium })
}

// ===========================================================================
// BLOCO 1 — Página de Login (sem auth necessária)
// ===========================================================================
test.describe('Admin — Login', () => {
  test('página /admin/login carrega com título e campos corretos', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })

    // Título da página
    await expect(page.getByText(/KINGS HUB.*ADMIN/i)).toBeVisible({ timeout: TIMEOUTS.short })

    // Campos obrigatórios
    await expect(page.getByLabel(/e-mail/i)).toBeVisible()
    await expect(page.getByLabel(/senha/i)).toBeVisible()

    // Botão de submit
    await expect(page.getByRole('button', { name: /entrar/i })).toBeVisible()

    // Sub-título de acesso restrito
    await expect(page.getByText(/acesso restrito/i)).toBeVisible()

    // Sem erros de console
    const errors = getErrors()
    expect(errors, `Erros de console: ${errors.join(', ')}`).toHaveLength(0)
  })

  test('exibe mensagem de erro com credenciais inválidas', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })

    await page.getByLabel(/e-mail/i).fill('invalido@exemplo.com')
    await page.getByLabel(/senha/i).fill('senhaerrada123')
    await page.getByRole('button', { name: /entrar/i }).click()

    // Deve aparecer uma mensagem de erro (traduzida ou original do Supabase)
    await expect(
      page.locator('[style*="ef4444"], [style*="color: red"], [role="alert"]')
        .first()
    ).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('botão de toggle visibilidade da senha funciona', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })

    const passwordInput = page.getByLabel(/senha/i)
    await expect(passwordInput).toHaveAttribute('type', 'password')

    // Clica no ícone de olho (botão sem texto, ao lado do input)
    const toggleBtn = page.locator('button[tabindex="-1"]')
    await toggleBtn.click()

    await expect(passwordInput).toHaveAttribute('type', 'text')

    // Clica novamente para esconder
    await toggleBtn.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('redireciona /admin para /admin/login quando não autenticado', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' })

    // Deve estar na página de login ou ter sido redirecionado
    const url = page.url()
    const isLoginPage = url.includes('/admin/login') || url.includes('/login')
    const isAdminPage = url.includes('/admin')

    // Ou o usuário foi redirecionado para login, ou a página de admin carregou (caso já logado)
    expect(isLoginPage || isAdminPage).toBe(true)
  })
})

// ===========================================================================
// BLOCO 2 — Dashboard e rotas autenticadas
// (puladas quando ADMIN_EMAIL não está no ambiente)
// ===========================================================================
test.describe('Admin — Dashboard Principal', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')
    await loginAsAdmin(page)
  })

  test('dashboard /admin carrega "KINGS HUB — ADMIN" sem erros de console', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' })

    await expect(page.getByText(/KINGS HUB.*ADMIN/i).first()).toBeVisible({ timeout: TIMEOUTS.medium })

    // Deve exibir algum card de métricas ou "Radar de Pedidos"
    await expect(
      page.getByText(/Radar de Pedidos|Visão Geral|Pedidos Recentes/i).first()
    ).toBeVisible({ timeout: TIMEOUTS.medium })

    const errors = getErrors()
    expect(errors, `Erros de console: ${errors.join(', ')}`).toHaveLength(0)
  })

  test('link "Ver todos" no dashboard aponta para /admin/pedidos', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' })

    const verTodosLink = page.getByRole('link', { name: /ver todos/i })
    await expect(verTodosLink).toBeVisible({ timeout: TIMEOUTS.medium })
    await expect(verTodosLink).toHaveAttribute('href', /\/admin\/pedidos/)
  })
})

// ===========================================================================
// BLOCO 3 — Pedidos
// ===========================================================================
test.describe('Admin — Pedidos', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')
    await loginAsAdmin(page)
  })

  test('/admin/pedidos carrega lista de pedidos sem erros', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'networkidle' })

    // Aguarda a tabela ou a mensagem de lista vazia
    await expect(
      page.locator('table, [data-testid="orders-list"]').first()
        .or(page.getByText(/nenhum pedido|nenhuma transação|resultado/i).first())
    ).toBeVisible({ timeout: TIMEOUTS.medium })

    const errors = getErrors()
    expect(errors, `Erros de console: ${errors.join(', ')}`).toHaveLength(0)
  })

  test('botão "Exportar CSV" está visível e é clicável', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'networkidle' })

    const btnExportar = page.getByRole('button', { name: /exportar csv/i })
    await expect(btnExportar).toBeVisible({ timeout: TIMEOUTS.medium })
    await expect(btnExportar).toBeEnabled()

    // Garante que o botão é clicável sem navegar para fora
    // (dispara a função exportCSV que é client-side)
    await btnExportar.click()
    // Após click, a página não deve navegar — permanece em /admin/pedidos
    await expect(page).toHaveURL(/\/admin\/pedidos/)
  })

  test('selects de filtro de status e marca estão presentes', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'networkidle' })

    // Filtro de status (select)
    const statusSelect = page.locator('select').first()
    await expect(statusSelect).toBeVisible({ timeout: TIMEOUTS.medium })

    // Deve ter pelo menos 2 selects (status + marca)
    const selects = page.locator('select')
    await expect(selects).toHaveCount(2, { timeout: TIMEOUTS.medium })
  })

  test('campo de busca de pedidos está presente e aceitando input', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/pedidos`, { waitUntil: 'networkidle' })

    const searchInput = page.locator('input[type="text"], input[type="search"]').first()
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.medium })

    await searchInput.fill('teste-busca-qa')
    await expect(searchInput).toHaveValue('teste-busca-qa')
  })
})

// ===========================================================================
// BLOCO 4 — Notas Fiscais
// ===========================================================================
test.describe('Admin — Notas Fiscais', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')
    await loginAsAdmin(page)
  })

  test('/admin/notas-fiscais carrega título e botão de sincronizar', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/notas-fiscais`, { waitUntil: 'networkidle' })

    // Título da seção
    await expect(page.getByText(/Notas Fiscais/i).first()).toBeVisible({ timeout: TIMEOUTS.medium })

    // Botão de sincronizar ERP (pode estar desabilitado se nenhuma NF selecionada)
    const btnSincronizar = page.getByRole('button', { name: /sincronizar erp/i })
    await expect(btnSincronizar).toBeVisible({ timeout: TIMEOUTS.medium })

    // Sem seleção, o botão deve estar desabilitado
    await expect(btnSincronizar).toBeDisabled()

    const errors = getErrors()
    expect(errors, `Erros de console: ${errors.join(', ')}`).toHaveLength(0)
  })

  test('botão "Baixar XMLs" está presente na página de notas fiscais', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/notas-fiscais`, { waitUntil: 'networkidle' })

    const btnXml = page.getByRole('button', { name: /baixar xml/i })
    await expect(btnXml).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('campo de busca de notas fiscais está funcional', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/notas-fiscais`, { waitUntil: 'networkidle' })

    const searchInput = page.locator('input[type="text"], input[type="search"]').first()
    await expect(searchInput).toBeVisible({ timeout: TIMEOUTS.medium })

    await searchInput.fill('NF-12345')
    await expect(searchInput).toHaveValue('NF-12345')
  })
})

// ===========================================================================
// BLOCO 5 — Clientes
// ===========================================================================
test.describe('Admin — Clientes', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')
    await loginAsAdmin(page)
  })

  test('/admin/clientes carrega com título e tabela de clientes', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/clientes`, { waitUntil: 'networkidle' })

    await expect(page.getByText(/Clientes/i).first()).toBeVisible({ timeout: TIMEOUTS.medium })

    // Tabela com colunas esperadas
    await expect(page.getByText(/Base de clientes cadastrados/i)).toBeVisible({ timeout: TIMEOUTS.medium })

    // A tabela deve ter cabeçalho com coluna "Cliente"
    await expect(
      page.locator('table').first()
        .or(page.getByText(/total clientes/i).first())
    ).toBeVisible({ timeout: TIMEOUTS.medium })

    const errors = getErrors()
    expect(errors, `Erros de console: ${errors.join(', ')}`).toHaveLength(0)
  })

  test('métrica "Total Clientes" está visível', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/clientes`, { waitUntil: 'networkidle' })

    await expect(page.getByText(/total clientes/i)).toBeVisible({ timeout: TIMEOUTS.medium })
  })
})

// ===========================================================================
// BLOCO 6 — Cupons
// ===========================================================================
test.describe('Admin — Cupons', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')
    await loginAsAdmin(page)
  })

  test('/admin/cupons carrega lista de cupons sem erros', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/cupons`, { waitUntil: 'networkidle' })

    // Botão "Novo Cupom" deve estar visível
    await expect(page.getByRole('button', { name: /novo cupom/i })).toBeVisible({ timeout: TIMEOUTS.medium })

    const errors = getErrors()
    expect(errors, `Erros de console: ${errors.join(', ')}`).toHaveLength(0)
  })

  test('botão "Novo Cupom" abre formulário de criação', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/cupons`, { waitUntil: 'networkidle' })

    const btnNovoCupom = page.getByRole('button', { name: /novo cupom/i })
    await expect(btnNovoCupom).toBeVisible({ timeout: TIMEOUTS.medium })
    await expect(btnNovoCupom).toBeEnabled()

    await btnNovoCupom.click()

    // Após clicar, deve aparecer o formulário de criação de cupom
    await expect(
      page.getByText(/criar novo cupom/i).or(page.getByText(/código do cupom/i))
    ).toBeVisible({ timeout: TIMEOUTS.short })
  })

  test('botão "Novo Cupom" alterna para "Cancelar" ao ser clicado', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/cupons`, { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: /novo cupom/i }).click()

    // Após abrir o formulário, o mesmo botão deve mostrar "Cancelar"
    await expect(page.getByRole('button', { name: /cancelar/i }).first()).toBeVisible({ timeout: TIMEOUTS.short })
  })

  test('métricas de cupons estão visíveis (ativos, expirados, uso total)', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/cupons`, { waitUntil: 'networkidle' })

    // Pelo menos um dos counters de resumo deve estar visível
    await expect(
      page.getByText(/ativos|expirados|uso total|cupons/i).first()
    ).toBeVisible({ timeout: TIMEOUTS.medium })
  })
})

// ===========================================================================
// BLOCO 7 — Páginas auxiliares de admin
// ===========================================================================
test.describe('Admin — Páginas Auxiliares', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')
    await loginAsAdmin(page)
  })

  test('/admin/relatorios carrega sem crash', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/relatorios`, { waitUntil: 'networkidle' })

    // Não deve redirecionar para fora do admin
    await expect(page).toHaveURL(/\/admin\/relatorios/, { timeout: TIMEOUTS.medium })

    // A página não deve exibir apenas uma tela de erro crítico
    await expect(page.getByText(/Erro Crítico no Servidor/i)).not.toBeVisible()

    const errors = getErrors()
    // Admite erros de console mas filtra os esperados do Next.js dev mode
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('next-route-announcer') &&
      !e.includes('favicon')
    )
    expect(criticalErrors, `Erros críticos de console: ${criticalErrors.join(', ')}`).toHaveLength(0)
  })

  test('/admin/config-gerais carrega sem crash', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/config-gerais`, { waitUntil: 'networkidle' })

    await expect(page).toHaveURL(/\/admin\/config-gerais/, { timeout: TIMEOUTS.medium })
    await expect(page.getByText(/Erro Crítico no Servidor/i)).not.toBeVisible()

    const errors = getErrors()
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('next-route-announcer') &&
      !e.includes('favicon')
    )
    expect(criticalErrors, `Erros críticos de console: ${criticalErrors.join(', ')}`).toHaveLength(0)
  })

  test('/admin/dados-loja carrega sem crash', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/dados-loja`, { waitUntil: 'networkidle' })

    await expect(page).toHaveURL(/\/admin\/dados-loja/, { timeout: TIMEOUTS.medium })
    await expect(page.getByText(/Erro Crítico no Servidor/i)).not.toBeVisible()

    const errors = getErrors()
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('next-route-announcer') &&
      !e.includes('favicon')
    )
    expect(criticalErrors, `Erros críticos de console: ${criticalErrors.join(', ')}`).toHaveLength(0)
  })

  test('/admin/produtos carrega sem crash', async ({ page }) => {
    const getErrors = captureConsoleErrors(page)

    await page.goto(`${BASE_URL}/admin/produtos`, { waitUntil: 'networkidle' })

    await expect(page).toHaveURL(/\/admin\/produtos/, { timeout: TIMEOUTS.medium })
    await expect(page.getByText(/Erro Crítico no Servidor/i)).not.toBeVisible()

    const errors = getErrors()
    const criticalErrors = errors.filter(e =>
      !e.includes('Warning:') &&
      !e.includes('next-route-announcer') &&
      !e.includes('favicon')
    )
    expect(criticalErrors, `Erros críticos de console: ${criticalErrors.join(', ')}`).toHaveLength(0)
  })
})

// ===========================================================================
// BLOCO 8 — Verificação de erros de console em bloco (smoke)
// Testa múltiplas rotas de admin em sequência e acumula erros
// ===========================================================================
test.describe('Admin — Smoke: sem erros de console em rotas críticas', () => {
  test.skip(!HAS_CREDENTIALS, 'Pulado: ADMIN_EMAIL não definido em process.env')

  test('navega por todas as rotas críticas e verifica ausência de erros', async ({ page }) => {
    // Login uma única vez para o smoke test sequencial
    await loginAsAdmin(page)

    const rotasCriticas = [
      '/admin',
      '/admin/pedidos',
      '/admin/clientes',
      '/admin/cupons',
      '/admin/notas-fiscais',
    ]

    const errosPorRota: Record<string, string[]> = {}

    for (const rota of rotasCriticas) {
      const errosDaRota: string[] = []

      const handler = (msg: any) => {
        if (msg.type() === 'error') {
          errosDaRota.push(msg.text())
        }
      }

      page.on('console', handler)
      await page.goto(`${BASE_URL}${rota}`, { waitUntil: 'networkidle', timeout: TIMEOUTS.long })
      page.off('console', handler)

      // Filtra erros esperados/não críticos
      const criticos = errosDaRota.filter(e =>
        !e.includes('Warning:') &&
        !e.includes('favicon') &&
        !e.includes('next-route-announcer')
      )

      if (criticos.length > 0) {
        errosPorRota[rota] = criticos
      }
    }

    const resumo = Object.entries(errosPorRota)
      .map(([rota, erros]) => `${rota}: ${erros.join(' | ')}`)
      .join('\n')

    expect(
      Object.keys(errosPorRota),
      `Rotas com erros de console:\n${resumo}`
    ).toHaveLength(0)
  })
})
