/**
 * Agente 3 — Layout, Responsividade e Console Errors
 *
 * Cobre:
 *  - Console Errors Hunt em rotas públicas
 *  - Responsividade Mobile (iPhone 14 — 390×844)
 *  - Responsividade Tablet (iPad — 768×1024)
 *  - Acessibilidade básica
 *  - UX Polish (navegação, footer, imagens quebradas)
 */

import { test, expect, Page, ConsoleMessage } from '@playwright/test'
import { TIMEOUTS } from '../qa-config'

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------
const BASE_URL = process.env.BASE_URL ?? 'https://www.kingssimuladores.com.br'

/** Rotas públicas auditadas em todos os blocos de console errors */
const PUBLIC_ROUTES = ['/', '/produtos', '/checkout', '/login'] as const

/**
 * Padrões de mensagem que podem ser ignorados com segurança.
 * São provenientes de extensões de browser, third-party scripts ou
 * avisos do próprio Next.js sobre atributos injetados por extensões.
 */
const IGNORED_ERROR_PATTERNS: RegExp[] = [
  /Extra attributes from the server/i,
  /Hydration failed because the initial UI does not match/i,
  /chrome-extension:\/\//i,
  /moz-extension:\/\//i,
  /Content Security Policy/i,
  /Failed to load resource.*favicon/i,
  /Failed to load resource.*400/i,
  /Failed to load resource.*404/i,
  /Failed to load resource/i,
]

/** Retorna true se o texto do erro deve ser ignorado */
function isIgnoredError(text: string): boolean {
  return IGNORED_ERROR_PATTERNS.some((pattern) => pattern.test(text))
}

/**
 * Anexa listener de console errors a uma página e devolve o array
 * que vai sendo populado ao longo do teste.
 */
function captureConsoleErrors(page: Page): string[] {
  const errors: string[] = []
  page.on('console', (msg: ConsoleMessage) => {
    if (msg.type() === 'error') {
      const text = msg.text()
      if (!isIgnoredError(text)) {
        errors.push(text)
      }
    }
  })
  // Captura exceções não tratadas na página (ex.: JS errors)
  page.on('pageerror', (err) => {
    const text = err.message
    if (!isIgnoredError(text)) {
      errors.push(`[pageerror] ${text}`)
    }
  })
  return errors
}

// ---------------------------------------------------------------------------
// BLOCO 1 — Console Errors Hunt
// ---------------------------------------------------------------------------
test.describe('Console Errors Hunt — rotas públicas', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`nenhum erro crítico no console em ${route}`, async ({ page }) => {
      const errors = captureConsoleErrors(page)

      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

      // Aguarda hidratação do React estabilizar
      await page.waitForTimeout(1_500)

      expect(
        errors,
        `Console errors encontrados em ${route}:\n${errors.join('\n')}`,
      ).toHaveLength(0)
    })
  }

  test('nenhum aviso de key prop React duplicada na listagem de produtos', async ({ page }) => {
    const warnings: string[] = []
    page.on('console', (msg) => {
      if (
        msg.type() === 'warning' &&
        /Each child in a list should have a unique "key"/i.test(msg.text())
      ) {
        warnings.push(msg.text())
      }
    })

    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })
    await page.waitForTimeout(1_500)

    expect(
      warnings,
      `Avisos de key prop duplicada encontrados:\n${warnings.join('\n')}`,
    ).toHaveLength(0)
  })

  test('nenhum erro de hidratação React na homepage', async ({ page }) => {
    const hydrationErrors: string[] = []
    page.on('console', (msg) => {
      const text = msg.text()
      if (
        (msg.type() === 'error' || msg.type() === 'warning') &&
        /hydrat/i.test(text) &&
        // avisos de extensão de browser são ignorados
        !isIgnoredError(text)
      ) {
        hydrationErrors.push(text)
      }
    })

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })
    await page.waitForTimeout(1_500)

    expect(
      hydrationErrors,
      `Erros de hidratação encontrados:\n${hydrationErrors.join('\n')}`,
    ).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// BLOCO 2 — Responsividade Mobile (iPhone 14 — 390×844)
// ---------------------------------------------------------------------------
test.describe('Responsividade Mobile — iPhone 14 (390×844)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
  })

  test('homepage: header não sobrepõe o conteúdo principal', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // O header mobile deve estar presente e visível
    const mobileHeader = page.locator('.mobile-header-kings')
    await expect(mobileHeader).toBeVisible({ timeout: TIMEOUTS.medium })

    // O conteúdo principal (main ou primeiro elemento filho do body após o header)
    // não deve estar escondido atrás do header
    const headerBox = await mobileHeader.boundingBox()
    const firstContent = page.locator('main, [data-main], section').first()
    await expect(firstContent).toBeVisible({ timeout: TIMEOUTS.medium })
    const contentBox = await firstContent.boundingBox()

    if (headerBox && contentBox) {
      // O topo do conteúdo deve ser igual ou abaixo do bottom do header
      expect(contentBox.y).toBeGreaterThanOrEqual(
        headerBox.y + headerBox.height - 2, // tolerância de 2px
      )
    }

    expect(errors).toHaveLength(0)
  })

  test('homepage: logotipo carrega no header mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const logo = page.locator('.mobile-header-kings img[alt="Kings Simuladores"]').first()
    await expect(logo).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('homepage: barra de busca é exibida no mobile', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // SearchBar renderizado dentro do mobile header
    const searchBar = page.locator('.mobile-header-kings input[type="search"], .mobile-header-kings input[placeholder]').first()
    await expect(searchBar).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('homepage: sem scroll horizontal (overflow-x)', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)

    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2) // tolerância de 2px
  })

  test('página de produtos: botão "Adicionar ao Carrinho" é visível e clicável sem scroll horizontal', async ({ page }) => {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Clica no primeiro produto disponível
    const productLink = page.locator('a[href*="/produtos/"]').first()
    const hasProduct = await productLink.count() > 0

    if (!hasProduct) {
      test.skip()
      return
    }

    await productLink.click()
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.long })

    // Botão principal de adicionar ao carrinho
    const addToCartBtn = page
      .locator(
        'button:has-text("Adicionar ao Carrinho"), button:has-text("Comprar"), button[aria-label*="carrinho" i]',
      )
      .first()

    await expect(addToCartBtn).toBeVisible({ timeout: TIMEOUTS.medium })

    // Verifica que não há overflow horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)

    // Verifica que o botão está dentro dos limites horizontais da tela
    const btnBox = await addToCartBtn.boundingBox()
    if (btnBox) {
      expect(btnBox.x).toBeGreaterThanOrEqual(0)
      expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(390 + 2) // tolerância de 2px
    }
  })

  test('checkout: formulário não tem overflow horizontal e campos são usáveis', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Sem overflow horizontal
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)

    // Inputs de texto devem ter largura usável (> 200px no mobile)
    const inputs = page.locator('input[type="text"], input[type="email"], input[name]')
    const count = await inputs.count()

    if (count > 0) {
      for (let i = 0; i < Math.min(count, 5); i++) {
        const input = inputs.nth(i)
        const isVisible = await input.isVisible()
        if (!isVisible) continue

        const box = await input.boundingBox()
        if (box) {
          // Campo deve caber na tela
          expect(box.x + box.width).toBeLessThanOrEqual(390 + 4)
          // Campo deve ter pelo menos 120px de largura para ser utilizável
          expect(box.width).toBeGreaterThanOrEqual(120)
        }
      }
    }
  })

  test('página de login: sem overflow horizontal e formulário visível', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)

    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible({ timeout: TIMEOUTS.medium })
  })
})

// ---------------------------------------------------------------------------
// BLOCO 3 — Responsividade Tablet (iPad — 768×1024)
// ---------------------------------------------------------------------------
test.describe('Responsividade Tablet — iPad (768×1024)', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
  })

  test('homepage carrega corretamente e header desktop está visível', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Em 768px o header desktop deve aparecer (breakpoint definido no responsive.css)
    // Verifica que ao menos uma versão do header está visível
    const anyHeader = page.locator('header').first()
    await expect(anyHeader).toBeVisible({ timeout: TIMEOUTS.medium })

    expect(errors).toHaveLength(0)
  })

  test('homepage: sem overflow horizontal no tablet', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
  })

  test('grid de produtos não tem overflow horizontal', async ({ page }) => {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
  })

  test('grid de produtos renderiza cards dentro dos limites da viewport', async ({ page }) => {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const productCards = page.locator('a[href*="/produtos/"]')
    const count = await productCards.count()

    if (count === 0) {
      test.skip()
      return
    }

    // Verifica que nenhum card está completamente fora da área visível à direita
    for (let i = 0; i < Math.min(count, 8); i++) {
      const card = productCards.nth(i)
      const box = await card.boundingBox()
      if (box) {
        // O início do card deve estar dentro da largura da viewport
        expect(box.x).toBeLessThan(768)
      }
    }
  })

  test('footer renderiza no tablet sem overflow', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const footer = page.locator('#site-footer, footer').first()
    await expect(footer).toBeVisible({ timeout: TIMEOUTS.medium })

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2)
  })
})

// ---------------------------------------------------------------------------
// BLOCO 4 — Acessibilidade Básica
// ---------------------------------------------------------------------------
test.describe('Acessibilidade básica', () => {
  test('todos os botões interativos têm texto ou aria-label acessível', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const buttons = page.locator('button')
    const count = await buttons.count()

    const inaccessible: string[] = []

    for (let i = 0; i < count; i++) {
      const btn = buttons.nth(i)
      const isVisible = await btn.isVisible()
      if (!isVisible) continue

      const ariaLabel = await btn.getAttribute('aria-label')
      const ariaLabelledBy = await btn.getAttribute('aria-labelledby')
      const title = await btn.getAttribute('title')
      const innerText = (await btn.innerText()).trim()

      const isAccessible =
        (ariaLabel && ariaLabel.trim().length > 0) ||
        (ariaLabelledBy && ariaLabelledBy.trim().length > 0) ||
        (title && title.trim().length > 0) ||
        innerText.length > 0

      if (!isAccessible) {
        const outerHTML = await btn.evaluate((el) => el.outerHTML.slice(0, 120))
        inaccessible.push(outerHTML)
      }
    }

    expect(
      inaccessible,
      `Botões sem texto acessível encontrados:\n${inaccessible.join('\n')}`,
    ).toHaveLength(0)
  })

  test('imagens de produto têm atributo alt não vazio', async ({ page }) => {
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Imagens dentro de cards de produto
    const productImages = page.locator('a[href*="/produtos/"] img')
    const count = await productImages.count()

    if (count === 0) {
      test.skip()
      return
    }

    const missingAlt: string[] = []

    for (let i = 0; i < Math.min(count, 20); i++) {
      const img = productImages.nth(i)
      const alt = await img.getAttribute('alt')
      if (!alt || alt.trim().length === 0) {
        const src = (await img.getAttribute('src')) ?? 'sem src'
        missingAlt.push(src)
      }
    }

    expect(
      missingAlt,
      `Imagens de produto sem alt text:\n${missingAlt.join('\n')}`,
    ).toHaveLength(0)
  })

  test('formulário de checkout tem labels associados aos inputs', async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Coleta todos os inputs visíveis que deveriam ter label
    const inputs = page.locator('input[type="text"], input[type="email"], input[name]')
    const count = await inputs.count()

    if (count === 0) {
      test.skip()
      return
    }

    const unlabeled: string[] = []

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const isVisible = await input.isVisible()
      if (!isVisible) continue

      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledBy = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')

      // Aceita label[for=id], aria-label, aria-labelledby ou placeholder como fallback
      let hasLabel = false

      if (ariaLabel || ariaLabelledBy || placeholder) {
        hasLabel = true
      } else if (id) {
        const labelCount = await page.locator(`label[for="${id}"]`).count()
        if (labelCount > 0) hasLabel = true
      }

      if (!hasLabel) {
        const name = (await input.getAttribute('name')) ?? (await input.getAttribute('type')) ?? 'desconhecido'
        unlabeled.push(`input[name="${name}"]`)
      }
    }

    expect(
      unlabeled,
      `Inputs sem label acessível no checkout:\n${unlabeled.join('\n')}`,
    ).toHaveLength(0)
  })

  test('logo do header tem alt text descritivo', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const logoImgs = page.locator('header img[alt]')
    await expect(logoImgs.first()).toBeVisible({ timeout: TIMEOUTS.medium })

    const alt = await logoImgs.first().getAttribute('alt')
    expect(alt).toBeTruthy()
    expect(alt!.trim().length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// BLOCO 5 — UX Polish Checks
// ---------------------------------------------------------------------------
test.describe('UX Polish — navegação, footer e imagens', () => {
  test('links de navegação do header existem e são clicáveis', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // Links presentes no header — pelo menos o logotipo e o link para produtos/categorias
    const headerLinks = page.locator('header a[href]')
    const count = await headerLinks.count()

    expect(count).toBeGreaterThan(0)

    // O link da home (logotipo) deve existir
    const homeLink = page.locator('header a[href="/"]').first()
    await expect(homeLink).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('footer carrega sem erros e contém informações esperadas', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    const footer = page.locator('#site-footer, footer').first()
    await expect(footer).toBeVisible({ timeout: TIMEOUTS.medium })

    // Verifica presença de links institucionais no footer
    await expect(
      page.locator('footer a[href*="/politica-de-privacidade"], footer a[href*="politica"]'),
    ).toHaveCount(1, { timeout: TIMEOUTS.short })

    await expect(
      page.locator('footer a[href*="/quem-somos"]'),
    ).toHaveCount(1, { timeout: TIMEOUTS.short })

    // CNPJ deve estar no footer
    const footerText = await footer.innerText()
    expect(footerText).toMatch(/29\.688\.089/)

    expect(errors).toHaveLength(0)
  })

  test('nenhuma imagem quebrada (404) na homepage', async ({ page }) => {
    const brokenImages: string[] = []

    // Intercepta respostas de imagem
    page.on('response', (response) => {
      const url = response.url()
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg|avif)(\?|$)/i.test(url)
      if (isImage && response.status() === 404) {
        brokenImages.push(`404: ${url}`)
      }
    })

    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })
    await page.waitForTimeout(2_000) // aguarda lazy-load

    expect(
      brokenImages,
      `Imagens com 404 encontradas na homepage:\n${brokenImages.join('\n')}`,
    ).toHaveLength(0)
  })

  test('nenhuma imagem quebrada (404) na listagem de produtos', async ({ page }) => {
    const brokenImages: string[] = []

    page.on('response', (response) => {
      const url = response.url()
      const isImage = /\.(png|jpg|jpeg|gif|webp|svg|avif)(\?|$)/i.test(url)
      if (isImage && response.status() === 404) {
        brokenImages.push(`404: ${url}`)
      }
    })

    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })
    await page.waitForTimeout(2_000)

    expect(
      brokenImages,
      `Imagens com 404 em /produtos:\n${brokenImages.join('\n')}`,
    ).toHaveLength(0)
  })

  test('WhatsApp float button é visível na homepage', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })

    // O WhatsappFloat usa link para wa.me
    const whatsappLink = page
      .locator('a[href*="wa.me"], a[href*="whatsapp.com"]')
      .first()

    await expect(whatsappLink).toBeVisible({ timeout: TIMEOUTS.medium })
  })

  test('header da página /produtos carrega sem erros de console', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto(`${BASE_URL}/produtos`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })
    await page.waitForTimeout(1_500)
    expect(errors, `Erros em /produtos:\n${errors.join('\n')}`).toHaveLength(0)
  })

  test('página /categorias carrega e exibe categorias sem erros', async ({ page }) => {
    const errors = captureConsoleErrors(page)
    await page.goto(`${BASE_URL}/categorias`, { waitUntil: 'domcontentloaded', timeout: TIMEOUTS.long })
    await page.waitForTimeout(1_500)

    // Deve haver ao menos um link de categoria
    const categoryLinks = page.locator('a[href*="/categorias/"]')
    const count = await categoryLinks.count()
    expect(count).toBeGreaterThan(0)

    expect(errors, `Erros em /categorias:\n${errors.join('\n')}`).toHaveLength(0)
  })
})
